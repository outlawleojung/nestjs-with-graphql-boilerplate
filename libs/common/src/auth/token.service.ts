import { UserEntity, UserEntityRepository } from '@lib/entity';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcryptjs from 'bcryptjs';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import {
  ENV_ACCESS_TOKEN_EXPIRES_IN,
  ENV_JWT_SECRET,
  ENV_REFRESH_TOKEN_EXPIRES_IN,
} from '@lib/common';

@Injectable()
export class TokenService {
  constructor(
    private readonly userRepository: UserEntityRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  signToken(user: Pick<UserEntity, 'id' | 'name'>, isRefreshToken: boolean) {
    const payload = {
      sub: user.id,
      nickname: user.name,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>(ENV_JWT_SECRET),
      expiresIn: isRefreshToken
        ? this.configService.get<string>(ENV_REFRESH_TOKEN_EXPIRES_IN)
        : this.configService.get<string>(ENV_ACCESS_TOKEN_EXPIRES_IN),
    });
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV_JWT_SECRET),
      });
    } catch (e) {
      console.log(e.toString());
      throw new UnauthorizedException('토큰이 만료 됐거나 유효하지 않습니다.');
    }
  }

  /**
   * 토큰 재발급
   * @param token
   * @param isRefreshToken
   * @returns
   */
  async rotateToken(token: string, isRefreshToken: boolean) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>(ENV_JWT_SECRET),
      });

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException(
          '토큰 재발급은 Refresh 토큰으로만 가능합니다.',
        );
      }

      // 데이터베이스에 있는 토큰과 비교
      const user = await this.userRepository.findById(decoded.sub);

      const validToken = bcryptjs.compareSync(token, user.refreshToken);
      console.log('validToken: ', validToken);

      if (!validToken) {
        throw new UnauthorizedException('Refresh 토큰이 유효하지 않습니다.');
      }

      return this.signToken(
        {
          ...decoded,
        },
        isRefreshToken,
      );
    } catch (e) {
      console.log(e.toString());
      throw new UnauthorizedException('토큰이 만료 됐거나 유효하지 않습니다.');
    }
  }

  /**
   * Refresh Token 데이터베이스에 저장
   * @param token
   */
  async saveRefreshToken(token: string) {
    const result = await this.verifyToken(token);

    // 토큰 암호화 설정
    const hashedRefreshToken = await bcryptjs.hash(token, 12);

    try {
      const user = new UserEntity();
      user.id = result.sub;
      user.refreshToken = hashedRefreshToken;

      await this.userRepository.updateUser(user.id, user);
    } catch (e) {
      console.log(e.toString());
      throw new ForbiddenException('Refresh 토큰 DB 저장 실패');
    }
  }

  async validRefreshToken(token: string) {
    const result = this.verifyToken(token);

    const user = await this.userRepository.findById(result.sub);

    const validToken = bcryptjs.compareSync(token, user.refreshToken);

    if (!validToken) {
      throw new UnauthorizedException('Refresh 토큰이 유효하지 않습니다.');
    }

    return user;
  }
}
