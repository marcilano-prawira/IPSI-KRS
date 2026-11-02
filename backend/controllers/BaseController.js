/** Bungkus handler async agar error otomatis diteruskan ke ErrorHandler. */
export class BaseController {
  handle(fn) {
    return (req, res, next) => Promise.resolve(fn.call(this, req, res)).catch(next);
  }
}
