import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { CreateUserDto, LoginDto } from '@makemyday/shared';

export class AuthController {
  static async register(req: Request, res: Response) {
    const data: CreateUserDto = req.body;
    const result = await AuthService.register(data);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          profile: result.user.profile,
          premium: result.user.premium,
        },
        tokens: result.tokens,
      },
    });
  }

  static async login(req: Request, res: Response) {
    const data: LoginDto = req.body;
    const result = await AuthService.login(data);

    res.json({
      success: true,
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          profile: result.user.profile,
          premium: result.user.premium,
        },
        tokens: result.tokens,
      },
    });
  }

  static async refreshToken(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const tokens = await AuthService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: { tokens },
    });
  }

  static async logout(req: Request, res: Response) {
    const { refreshToken } = req.body;
    await AuthService.logout(refreshToken);

    res.json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  }
}
