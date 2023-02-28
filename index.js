const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

const defaultTemplate = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');


try {
    const basePath = core.getInput('path') || '.';
    const jsonPath = core.getInput('json') || 'links.json';
    const templatePath = core.getInput('template');

    if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });

    let template;
    try {
        template = templatePath ? fs.readFileSync(templatePath, 'utf8') : defaultTemplate;
    } catch (e) {
        throw new Error("Template file not found");
    }

    let json;
    try {
        json = fs.readFileSync(jsonPath);
    } catch (e) {
        throw new Error("JSON file not found");
    }

    let data;
    try {
        data = JSON.parse(json);
    } catch (e) {
        throw new Error("Failed to parse JSON file:\n" + e.message);
    }

    if (!data.links || typeof data.links != "object") throw new Error(`JSON file does not contain 'links' object!`);
    if (data.separators && (!Array.isArray(data.separators) || !data.separators.length || data.separators.some(e => typeof e != "string"))) throw new Error(`JSON property 'separators' should be a non-empty array of strings`);

    const separators = data.separators || ['-'];

    function createPage(name, url) {
        if (name.includes('/')) {
            fs.mkdirSync(path.join(basePath, path.dirname(name)), { recursive: true })
        }

        const filePath = path.join(basePath, name + '.html');
        if (fs.existsSync(filePath)) {
            core.warning(`Found duplicate for link ${name}`);
            return;
        }

        console.log('Generating page ' + name + ' with redirect to ' + url);
        fs.writeFileSync(filePath, template.replaceAll('%URL%', url));
    }

    function createLinks(links, base = '') {
        for (let [key, value] of Object.entries(links)) {
            if (typeof value == "string") {
                const content = value;
                if (key.endsWith('$')) key = key.slice(0, -1);
                createPage(base + key, content);
            } else if (typeof value == "object") {
                for (const separator of separators) {
                    createLinks(value, base + key + separator);
                }
            } else {
                core.warning(`Invalid link type at ${base}-${key}`)
            }
        }
    }

    createLinks(data.links);
} catch (error) {
    core.setFailed(error.message);
}