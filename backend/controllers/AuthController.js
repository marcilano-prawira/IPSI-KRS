import { BaseController } from "./BaseController.js";

export class AuthController extends BaseController {
  constructor(authService) {
    super();
    this.authService = authService;
  }

  login = this.handle(async (req, res) => {
    const { username, password } = req.body;
    res.json(await this.authService.login(username, password));
  });
}
