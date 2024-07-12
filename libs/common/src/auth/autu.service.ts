import { v1 } from 'uuid';

import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcryptjs from 'bcryptjs';
import * as crypto from 'crypto';
import { QueryRunner } from 'typeorm';
import { UserEntityRepository } from '@lib/entity/repositories/user.repository';
import { UserEntity } from '@lib/entity/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import {
  ENV_ACCESS_TOKEN_EXPIRES_IN,
  ENV_JWT_SECRET,
  ENV_REFRESH_TOKEN_EXPIRES_IN,
} from '@lib/common';

// import { ResetPasswordDto } from './dto/reset-password.dto';
// import { UserPasswordAuth } from '../entity/user-password-auth.entity';
// import { UserPasswordAuthRepository } from '../repository/member-password-auth.repository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserEntityRepository,
    private readonly configService: ConfigService,
    // private readonly emailConfirmRepository: EmailConfirmRepository,
    // private readonly emailVerificationRepository: EmailVerificationRepository,
    // private readonly userPasswordAuthRepository: UserPasswordAuthRepository,
    // private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  extractTokenFromHeader(header: string, isBearer: boolean) {
    const splitToken = header.split(' ');
    const prefix = isBearer ? 'Bearer' : 'Basic';
    if (splitToken.length !== 2 || splitToken[0] !== prefix) {
      return 'error';
    }

    const token = splitToken[1];

    return token;
  }

  decodeBasicToken(base64String: string) {
    const decoded = Buffer.from(base64String, 'base64').toString('utf8');

    const split = decoded.split(':');

    if (split.length !== 2) {
      throw new UnauthorizedException('잘못된 로그인 토큰 입니다.');
    }

    const email = split[0];
    const password = split[1];

    return {
      email,
      password,
    };
  }

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
      // const member = await this.memberRepository.findOne({
      //   where: {
      //     id: decoded.sub,
      //   },
      // });
      const user = await this.userRepository.findById(decoded.sub);

      const validToken = await bcryptjs.compareSync(token, user.refreshToken);
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
  async saveRefreshToken(token) {
    const result = this.verifyToken(token);

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

  async loginUser(user: Pick<UserEntity, 'id' | 'name'>) {
    const refreshToken = this.signToken(user, true);

    await this.saveRefreshToken(refreshToken);

    return {
      accessToken: this.signToken(user, false),
      refreshToken,
    };
  }

  async validRefreshToken(token: string) {
    const result = this.verifyToken(token);

    const user = await this.userRepository.findById(result.sub);

    const validToken = await bcryptjs.compareSync(token, user.refreshToken);

    if (!validToken) {
      throw new UnauthorizedException('Refresh 토큰이 유효하지 않습니다.');
    }

    return user;
  }

  async authenticateWithEmailAndPassword(
    user: Pick<UserEntity, 'email' | 'password'>,
  ) {
    const email = user.email;
    const exUser = await this.userRepository.findByEmail(email);

    if (!exUser) {
      this.logger.error('패사용자를 찾을 수 없음');
      throw new Error('사용자를 찾을 수 없음');
    }

    const validPassword = await bcryptjs.compareSync(
      user.password,
      exUser.password,
    );

    if (!validPassword) {
      this.logger.error('패스워드가 일치 하지 않음');
      throw new Error('패스워드가 일치 하지 않음');
    }

    const newUser = await this.userRepository.findByUserId(exUser.id);

    return newUser;
  }

  async autoLogin(token: string) {
    const user = await this.validRefreshToken(token);
    return await this.loginUser(user);
  }

  async loginWithEmail(user: Pick<UserModel, 'email' | 'password'>) {
    const exMember = await this.authenticateWithEmailAndPassword(user);

    return await this.loginUser(exMember);
  }

  // 자체 계정 생성
  async registerWithEmail(
    user: Pick<UserModel, 'email' | 'password' | 'name'>,
    queryRunner: QueryRunner,
  ) {
    const email = user.email;
    const name = user.name;

    // 이메일 중복 검증
    const exAccount = await this.userRepository.findByEmail(user.email);

    if (exAccount) {
      this.logger.error('존재 하는 이메일 입니다.');
      throw new Error('존재 하는 이메일 입니다.');
    }

    // 이메일 인증 여부 확인
    const emailConfirm = await this.emailConfirmRepository.existsByEmail(email);

    if (!emailConfirm) {
      this.logger.error('인증 되지 않은 이메일 입니다.');
      throw new Error('인증 되지 않은 이메일 입니다.');
    }

    // 인증 된 이메일 정보 삭제
    await this.emailVerificationRepository.deleteByExists(email, queryRunner);
    await this.emailConfirmRepository.deleteByExists(email, queryRunner);

    //패스워드 설정
    const password: string = user.password;
    const hashedPassword = await bcryptjs.hash(password, 12);

    const userInfo = await this.createUser(email, password, name, queryRunner);

    return await this.loginUser(userInfo);
  }

  async validateUser(accessToken: string) {
    try {
      const result = await this.verifyToken(accessToken);
      return await this.userRepository.findByEmail(result.email);
    } catch (error) {
      console.log('토큰 오류 :', error.toString());

      throw error;
    }
  }

  async createUser(
    email: string,
    password: string,
    name: string,
    queryRunner: QueryRunner,
  ) {
    const user = new UserModel();
    user.email = email;
    user.password = password;
    user.name = name;

    await this.userRepository.createUser(user, queryRunner);

    return user;
  }

  // 이메일 인증 번호 받기
  async authEmail(authEmail: AuthEmailDto, queryRunner: QueryRunner) {
    const email = String(authEmail.email);
    const remainTime = Number(process.env.MAIL_REMAIN_MINIUTE || 3) * 60 * 1000;

    if (email.length < 6) {
      throw new Error('유효하지 않은 이메일 입니다.');
    }

    // 사용자 존재 여부 확인
    const exUser = await this.userRepository.findByEmail(email);

    if (exUser) {
      throw Error('이미 가입 된 이메일 입니다.');
    }

    // 이메일과 인증 코드를 데이터베이스에 저장한다.
    const authCode: number = Math.floor(Math.random() * 8999) + 1000;

    // 이메일 보내기
    const emailOptions: EmailOptions = {
      to: email,
      subject: '[서비스] 회원가입 이메일 인증',
      html: 'email-auth',
      text: '인증 메일 입니다.',
    };

    const context = {
      authCode: authCode,
      remainTime: remainTime / 60 / 1000,
    };

    this.mailService.sendEmail(emailOptions, context);

    // 기존에 정보가 남아 있다면 삭제한다.
    await this.emailVerificationRepository.deleteByExists(email, queryRunner);

    await this.emailVerificationRepository.create(email, authCode, queryRunner);

    setTimeout(async () => {
      await this.emailVerificationRepository.deleteByExists(email);
    }, remainTime);

    // 이메일 인증 여부 확인 후 정보가 있다면 삭제 (추후 인증번호로 인증 후 다시 저장)
    await this.emailConfirmRepository.deleteByExists(email);

    return {
      remainTime: parseInt(process.env.MAIL_REMAIN_MINIUTE) * 60,
    };
  }

  // 이메일 인증 번호 확인
  async confirmEmail(confirmemail: ConfirmEmailDto, queryRunner: QueryRunner) {
    const email: string = String(confirmemail.email);
    const authCode: number = Number(confirmemail.authCode);
    // 이메일 인증 번호 확인
    const emailCheck =
      await this.emailVerificationRepository.findByEmailAndAuthCode(
        email,
        authCode,
      );

    if (!emailCheck) {
      throw new Error('인증 번호가 틀립니다.');
    }

    // 인증 완료 시 인증 번호 삭제
    await this.emailVerificationRepository.deleteById(
      emailCheck.id,
      queryRunner,
    );

    // 인증 완료 여부 저장
    await this.emailConfirmRepository.create(email, queryRunner);

    // 저장 된 정보 3분 후 자동 삭제
    setTimeout(
      async () => {
        await this.emailConfirmRepository.deleteByExists(email);
      },
      60 * 3 * 1000,
    );

    return HttpStatus.OK;
  }

  // 패스워드 재설정
  async resetPassword(
    resetPassword: ResetPasswordDto,
    queryRunner: QueryRunner,
  ) {
    const email = resetPassword.email;

    const exUser = await this.userRepository.findByEmail(email);

    if (!exUser) {
      this.logger.error('존재하지 않는 사용자 입니다.');
      throw new Error('존재하지 않는 사용자 입니다.');
    }

    const token = crypto.randomBytes(20).toString('hex'); // token 생성
    const data = new UserPasswordAuth();

    data.token = token;
    data.userId = exUser.id;
    data.ttl = Number(process.env.MAIL_REMAIN_MINIUTE) * 60; // ttl 값 설정 (3분)

    await this.userPasswordAuthRepository.create(data, queryRunner);

    // 이메일 발송
    const emailOptions: EmailOptions = {
      to: email,
      subject: '[서비스] 패스워드 재설정 이메일',
      html: 'passwordReset',
      text: '패스워드 재설정 이메일 입니다.',
    };

    const context = {
      url: process.env.HOMEPAGE_FRONT_URL,
      token: token,
      email: email,
      remainTime: Number(process.env.MAIL_REMAIN_MINIUTE),
    };
    this.mailService.sendEmail(emailOptions, context);

    return HttpStatus.OK;
  }
}
