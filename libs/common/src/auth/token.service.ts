import { UserEntity, UserEntityRepository } from '@lib/entity';
import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcryptjs from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import {
  ENV_ACCESS_TOKEN_EXPIRES_IN,
  ENV_JWT_SECRET,
  ENV_REFRESH_TOKEN_EXPIRES_IN,
  LoginAuthDto,
} from '@lib/common';
import { QueryRunner } from 'typeorm';
import { PROVIDER_TYPE } from '@lib/common/constants/constants';

@Injectable()
export class TokenService {
  constructor(
    private readonly userRepository: UserEntityRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private readonly logger = new Logger(TokenService.name);

  signToken(user: LoginAuthDto, isRefreshToken: boolean) {
    const payload = {
      sub: user.id,
      nickname: user.name,
      type: isRefreshToken ? 'refresh' : 'access',
    };

    const secret = this.configService.get<string>(ENV_JWT_SECRET);
    const expiresIn = isRefreshToken
      ? this.configService.get<string>(ENV_REFRESH_TOKEN_EXPIRES_IN)
      : this.configService.get<string>(ENV_ACCESS_TOKEN_EXPIRES_IN);

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
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
  async rotateToken(
    token: string,
    isRefreshToken: boolean,
    queryRunner: QueryRunner,
  ) {
    try {
      const decoded = this.verifyToken(token);

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException(
          '토큰 재발급은 Refresh 토큰으로만 가능합니다.',
        );
      }

      // 데이터베이스에 있는 토큰과 비교
      const user = await this.userRepository.findUserBySelectField(
        {
          selectedFields: ['id', 'name', 'refreshToken'],
          id: decoded.sub,
          providerTypeId: PROVIDER_TYPE.LOCAL,
        },
        queryRunner,
      );

      console.log(user);
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
  async saveRefreshToken(token: string, queryRunner?: QueryRunner) {
    try {
      const result = await this.verifyToken(token);

      // 토큰 암호화 설정
      const hashedRefreshToken = await bcryptjs.hash(token, 12);

      const user = new UserEntity();
      user.id = result.sub;
      user.refreshToken = hashedRefreshToken;

      await this.userRepository.updateUser(user.id, user, queryRunner);
    } catch (e) {
      console.log(e.toString());
      throw new ForbiddenException('Refresh 토큰 DB 저장 실패');
    }
  }

  async validRefreshToken(token: string) {
    const result = this.verifyToken(token);

    const user = await this.userRepository.findUserBySelectField({
      selectedFields: ['id', 'refreshToken'],
      id: result.sub,
    });

    const validToken = bcryptjs.compareSync(token, user.refreshToken);

    if (!validToken) {
      throw new UnauthorizedException('Refresh 토큰이 유효하지 않습니다.');
    }

    return user;
  }
}
