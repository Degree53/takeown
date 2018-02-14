# takeown
Forcibly take control of directories on Windows to prevent permissions and file locking errors.

```javascript
takeown(path_to_take_ownership_of, function () {
	// make sure to throw EPERM, EACCES, EBUSY and ENOTEMPTY
	// errors in your callback so that takeown can handle them
});
```
