# Active HTML

A centralized bridge between JavaScript Entity classes and Laravel Eloquent models. This package provides a reusable "Model DAO" logic to sync frontend JS entities with backend Laravel models.

## 1. Prerequisites
* **Laravel 12.x**
* **Tailwind CSS 4.x**
* **Vite 6.x**

---

## 2. Installation

### PHP (Composer)
Since this is likely a private or custom repo, add this to your project's `composer.json`:
```json
"repositories": [
    {
        "type": "vcs",
        "url": "[https://github.com/chaysehartsuff/active-html](https://github.com/chaysehartsuff/active-html)"
    }
],
"require": {
    "chaysehartsuff/active-html": "dev-main"
}
```

### Upload progress

Pass an optional upload progress callback as the fifth argument to `Dao.request`
or the sixth argument to `Dao.modelRequest`. The callback receives a native
`ProgressEvent`; only calculate a percentage when `lengthComputable` is true.

```js
Dao.request('/upload', formData, (result) => {
    console.log(result);
}, 'POST', (event) => {
    if (event.lengthComputable) {
        console.log(event.loaded / event.total * 100);
    }
});

Dao.modelRequest('create', model, (result) => {
    console.log(result);
}, {}, {}, (event) => {
    console.log(event.loaded, event.total);
});
```

Requests without a progress callback continue to use `fetch`. Requests with a
progress callback use `XMLHttpRequest` to report **upload** progress. Cross-origin
requests with upload listeners may require a CORS preflight. `modelRequest`
sends JSON; use `request` with `FormData` for multipart file uploads. Upload
completion does not imply that the server has finished processing the request;
use the response callback or returned promise for that.