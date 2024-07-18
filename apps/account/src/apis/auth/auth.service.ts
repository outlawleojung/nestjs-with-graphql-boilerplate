import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

import { AccountEntityRepository, UserEntityRepository } from '@lib/entity';
import { QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  ENV_HASH_ROUNDS_KEY,
  TokenService,
  UserValidationService,
  TokenUtilsService,
  LoginAuthDto,
  RegisterWithEmailInput,
  ENV_GOOGLE_CLIENT_ID,
  SocialUser,
} from '@lib/common';
import { ConfigService } from '@nestjs/config';
import { TokenOutput } from './dto/token.output';
import { TokenResponseDto } from './dto/access-token.dto';
import { CheckUserRegisterInput } from './dto/check-user-register.input';
import { PROVIDER_TYPE } from '@lib/common/constants/constants';
import { RegisterWithSocialInput } from '@lib/common/dto/register-with-social.input';
import { LoginWithSocialInput } from '@lib/common/dto/login-with-social.input';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient = new OAuth2Client(
    this.configService.get<string>(ENV_GOOGLE_CLIENT_ID),
  );

  constructor(
    private readonly userRepository: UserEntityRepository,
    private readonly accountRepository: AccountEntityRepository,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly tokenUtilsService: TokenUtilsService,
    private readonly userValidationService: UserValidationService,
  ) {}

  /**
   * 이메일 패스워드 로그인
   * @param rawToken
   * @param queryRunner
   */
  async loginWithEmail(rawToken: string, queryRunner: QueryRunner) {
    const token = this.tokenUtilsService.extractTokenFromHeader(
      rawToken,
      false,
    );

    const credentials = this.tokenUtilsService.decodeBasicToken(token);

    console.log(credentials);

    const exUser =
      await this.userValidationService.authenticateWithEmailAndPassword(
        credentials,
        queryRunner,
      );

    const result: TokenOutput = await this.loginUser(exUser);

    await this.tokenService.saveRefreshToken(result.refreshToken);

    return result;
  }

  // async validateUser(accessToken: string) {
  //   try {
  //     const result = await this.tokenService.verifyToken(accessToken);
  //     return await this.userRepository.findByEmail(result.email);
  //   } catch (error) {
  //     console.log('토큰 오류 :', error.toString());
  //
  //     throw error;
  //   }
  // }

  /**
   * 이메일 패스워드 계정 생성
   * @param data
   * @param queryRunner
   */
  registerWithEmail = async (
    data: RegisterWithEmailInput,
    queryRunner: QueryRunner,
  ) => {
    const hash = await bcrypt.hash(
      data.password,
      parseInt(this.configService.get<string>(ENV_HASH_ROUNDS_KEY)),
    );

    const user = await this.userRepository.createWithEmail(
      {
        ...data,
      },
      queryRunner,
    );

    console.log('--------------- register with email create user ------------');

    await this.accountRepository.createAccount(
      {
        userId: user.id,
        email: data.email,
        providerTypeId: data.providerTypeId,
        password: hash,
      },
      queryRunner,
    );

    console.log(
      '--------------- register with email create account ------------',
    );

    const newUser: LoginAuthDto = {
      id: user.id,
      email: data.email,
      name: data.name,
      providerTypeId: PROVIDER_TYPE.LOCAL,
    };

    const result: TokenOutput = await this.loginUser(newUser);

    await this.tokenService.saveRefreshToken(result.refreshToken, queryRunner);

    return result;
  };

  /**
   * 로그인 후 토큰 발급
   * @param user
   */
  async loginUser(user: LoginAuthDto): Promise<TokenOutput> {
    return {
      accessToken: this.tokenService.signToken(user, false),
      refreshToken: this.tokenService.signToken(user, true),
    };
  }

  /**
   * 소셜 사용자 가입 여부 확인
   * @param input
   */
  async checkUserRegister(input: CheckUserRegisterInput) {
    const socialUserInfo = await this.getSocialProviderUserInfo(
      input.idToken,
      input.providerTypeId,
    );

    const exUser = await this.userRepository.findUserBySelectField({
      selectedFields: ['id', 'accounts.socialToken'],
      socialToken: socialUserInfo.socialToken,
      providerTypeId: input.providerTypeId,
    });
    return !!exUser;
  }

  /**
   * 토큰 재발급 생성
   * @param rawToken
   * @param isBearer
   * @param isRefresh
   * @param queryRunner
   */
  async generateToken(
    rawToken: string,
    isBearer: boolean,
    isRefresh: boolean,
    queryRunner: QueryRunner,
  ): Promise<TokenResponseDto> {
    const token = this.tokenUtilsService.extractTokenFromHeader(
      rawToken,
      isBearer,
    );
    const newToken = await this.tokenService.rotateToken(
      token,
      isRefresh,
      queryRunner,
    );

    if (isRefresh) {
      await this.tokenService.saveRefreshToken(newToken);
      return {
        refreshToken: newToken,
      };
    } else {
      return {
        accessToken: newToken,
      };
    }
  }

  /**
   * 소셜 회원 가입
   * @param input
   * @param queryRunner
   */
  async registerWithSocial(
    input: RegisterWithSocialInput,
    queryRunner: QueryRunner,
  ) {
    const userInfo = await this.getSocialProviderUserInfo(
      input.idToken,
      input.providerTypeId,
    );

    const user = await this.userRepository.createWithSocial(
      userInfo,
      queryRunner,
    );

    await this.accountRepository.createAccount(
      {
        userId: user.id,
        email: userInfo.email,
        providerTypeId: input.providerTypeId,
        socialToken: userInfo.socialToken,
      },
      queryRunner,
    );

    const newUser: LoginAuthDto = {
      id: user.id,
      email: userInfo.email,
      name: userInfo.name,
      providerTypeId: input.providerTypeId,
    };

    const result: TokenOutput = await this.loginUser(newUser);
    await this.tokenService.saveRefreshToken(result.refreshToken, queryRunner);

    return result;
  }

  /**
   * 소셜 회원 로그인
   * @param input
   * @param queryRunner
   */
  async loginWithSocial(
    input: LoginWithSocialInput,
    queryRunner: QueryRunner,
  ): Promise<TokenOutput> {
    const socialUserInfo = await this.getSocialProviderUserInfo(
      input.idToken,
      input.providerTypeId,
    );

    const exUser = await this.userValidationService.authenticateWithSocialToken(
      socialUserInfo.socialToken,
      input.providerTypeId,
      queryRunner,
    );

    const result: TokenOutput = await this.loginUser(exUser);

    await this.tokenService.saveRefreshToken(result.refreshToken);

    return result;
  }

  /**
   * 구글 계정 유효성 검증
   * @param token
   */
  async verifyGoogleToken(token: string): Promise<SocialUser> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>(ENV_GOOGLE_CLIENT_ID),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return {
        socialToken: payload.sub,
        email: payload.email,
        name: payload.name,
        profileImg: payload.picture,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  /**
   * 애플 계정 유효성 검증
   * @param token
   */
  async verifyAppleToken(token: string): Promise<SocialUser> {
    try {
      const appleKeysUrl = 'https://appleid.apple.com/auth/keys';
      const { data: appleKeys } = await axios.get(appleKeysUrl);
      const decodedHeader = jwt.decode(token, { complete: true }).header;
      const key = appleKeys.keys.find((k) => k.kid === decodedHeader.kid);
      const publicKey = `-----BEGIN PUBLIC KEY-----\n${key.n}\n-----END PUBLIC KEY-----`;
      const payload = jwt.verify(token, publicKey, {
        algorithms: ['RS256'],
      }) as any;
      return {
        socialToken: payload.sub,
        email: payload.email,
        name: payload.email.split('@')[0], // Apple doesn't provide a name
        profileImg: null, // Apple doesn't provide a picture
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  /**
   * 카카오 계정 유효성 검증
   * @param token
   */
  async verifyKakaoToken(token: string): Promise<SocialUser> {
    try {
      const url = 'https://kapi.kakao.com/v1/user/access_token_info';
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      const data = response.data;
      return {
        socialToken: data.id,
        email: data.kakao_account.email,
        name: data.properties.nickname,
        profileImg: data.properties.profile_image,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Kakao token');
    }
  }

  /**
   * 네이버 계정 유효성 검증
   * @param token
   */
  async verifyNaverToken(token: string): Promise<SocialUser> {
    try {
      const url = 'https://openapi.naver.com/v1/nid/me';
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(url, { headers });
      const data = response.data.response;
      return {
        socialToken: data.id,
        email: data.email,
        name: data.nickname,
        profileImg: data.profile_image,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid Naver token');
    }
  }

  private async getSocialProviderUserInfo(
    idToken: string,
    providerTypeId: number,
  ) {
    let userInfo: SocialUser | null;
    switch (providerTypeId) {
      case PROVIDER_TYPE.GOOGLE:
        userInfo = await this.verifyGoogleToken(idToken);
        break;
      case PROVIDER_TYPE.APPLE:
        userInfo = await this.verifyAppleToken(idToken);
        break;
      case PROVIDER_TYPE.NAVER:
        userInfo = await this.verifyNaverToken(idToken);
        break;
      case PROVIDER_TYPE.KAKAO:
        userInfo = await this.verifyKakaoToken(idToken);
        break;
      default:
        throw new Error('Unsupported provider');
    }

    return userInfo;
  }
}
