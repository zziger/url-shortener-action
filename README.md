# URL shortener action

This action allows you to easily generate HTML pages needed for a simple URL shortener hosted on GitHub Pages.

## Inputs

### `path`

Path to the uploaded website root

Default: `.`

### `json`

Path to a config JSON file.

Default: `links.json`

### `template`

Optional path to a custom template file for redirection pages.<br/>
GitHub Pages does not support returning 301/302, so in order to redirect this action uses `<meta http-equiv="refresh">` tag.<br/>
Your custom template should contain the tag, every `%URL%` occurence in the template will be replaced with the actual URL.<br/>
For default template see [template.html](./template.html)

## Config JSON

### Fields

#### `links`

Object with links. Key is a shortened url key, value is either string or object.<br/>
String value will make a redirection URL, object value allows to have grouped/nested URLs.

#### `separators`

Array with characters to separate group URL parts. See example below.
Default is `["-"]`

### Example config

```json
{
    "separators": ["-", "/"],
    "links": {
        "foo": "https://google.com",
        "bar": {
            "baz": "https://github.com"
        }
    }
}
```

This config will produce:

- foo -> https://google.com
- bar-baz -> https://github.com
- bar/baz -> https://github.com


## Example usage


```yaml
uses: zziger/url-shortener-action@v1.0
with:
    path: './public'
    json: './config.json'
    template: './mytemplate.html'
```