const fs = require('fs');
const path = require('path');

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
  console.log(`Created: ${filePath}`);
}

const files = {
  // AUTH MODULE
  'backend/src/modules/auth/auth.module.ts': `
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
`,

  'backend/src/modules/auth/auth.service.ts': `
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../../database/supabase.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, firstName, lastName, phone, role } = dto;

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await this.supabase.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role || 'motorist',
        },
      },
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        throw new ConflictException('Cet email est déjà utilisé');
      }
      throw new BadRequestException(authError.message);
    }

    if (!authData.user) {
      throw new BadRequestException('Erreur lors de la création du compte');
    }

    // Update profile with phone if provided
    if (phone) {
      await this.supabase.client
        .from('profiles')
        .update({ phone })
        .eq('id', authData.user.id);
    }

    // Get the profile
    const { data: profile } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // Generate tokens
    const tokens = this.generateTokens(authData.user.id, email, profile?.role || 'motorist');

    return {
      user: profile,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const { data: authData, error: authError } = await this.supabase.client.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Get profile
    const { data: profile } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!profile) {
      throw new UnauthorizedException('Profil non trouvé');
    }

    if (!profile.is_active) {
      throw new UnauthorizedException('Compte désactivé');
    }

    const tokens = this.generateTokens(authData.user.id, email, profile.role);

    return {
      user: profile,
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const { data: profile } = await this.supabase.client
        .from('profiles')
        .select('*')
        .eq('id', payload.sub)
        .single();

      if (!profile) {
        throw new UnauthorizedException('Utilisateur non trouvé');
      }

      return this.generateTokens(payload.sub, profile.email, profile.role);
    } catch (error) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
    });

    return { accessToken, refreshToken };
  }

  async validateUser(userId: string) {
    const { data: profile } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    return profile;
  }
}
`,

  'backend/src/modules/auth/auth.controller.ts': `
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Créer un nouveau compte' })
  @ApiResponse({ status: 201, description: 'Compte créé avec succès' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Se connecter' })
  @ApiResponse({ status: 200, description: 'Connexion réussie' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rafraîchir les tokens' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }
}
`,

  'backend/src/modules/auth/strategies/jwt.strategy.ts': `
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.authService.validateUser(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Compte désactivé');
    }

    return user;
  }
}
`,

  'backend/src/modules/auth/dto/register.dto.ts': `
import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @ApiPropertyOptional({ example: 'Jean' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Dupont' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: '+237600000000' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['motorist', 'garage', 'mechanic'], default: 'motorist' })
  @IsOptional()
  @IsIn(['motorist', 'garage', 'mechanic'])
  role?: string;
}
`,

  'backend/src/modules/auth/dto/login.dto.ts': `
import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;
}
`,

  'backend/src/modules/auth/dto/refresh-token.dto.ts': `
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
`,

  'backend/src/modules/auth/dto/index.ts': `
export * from './register.dto';
export * from './login.dto';
export * from './refresh-token.dto';
`,

  // USERS MODULE
  'backend/src/modules/users/users.module.ts': `
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
`,

  'backend/src/modules/users/users.service.ts': `
import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class UsersService {
  constructor(private readonly supabase: SupabaseService) {}

  async findById(id: string) {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return data;
  }

  async update(id: string, updateData: any) {
    const { data, error } = await this.supabase.client
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
`,

  'backend/src/modules/users/users.controller.ts': `
import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtenir mon profil' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Mettre à jour mon profil' })
  async updateProfile(@CurrentUser() user: any, @Body() updateData: any) {
    return this.usersService.update(user.id, updateData);
  }
}
`,

  // VEHICLES MODULE
  'backend/src/modules/vehicles/vehicles.module.ts': `
import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
`,

  'backend/src/modules/vehicles/vehicles.service.ts': `
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../database/supabase.service';

@Injectable()
export class VehiclesService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(ownerId: string) {
    const { data, error } = await this.supabase.client
      .from('vehicles')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string, ownerId: string) {
    const { data, error } = await this.supabase.client
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Véhicule non trouvé');
    if (data.owner_id !== ownerId) throw new ForbiddenException();
    return data;
  }

  async create(ownerId: string, createData: any) {
    const { data, error } = await this.supabase.client
      .from('vehicles')
      .insert({ ...createData, owner_id: ownerId })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, ownerId: string, updateData: any) {
    await this.findOne(id, ownerId);
    
    const { data, error } = await this.supabase.client
      .from('vehicles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string, ownerId: string) {
    await this.findOne(id, ownerId);
    
    const { error } = await this.supabase.client
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return { success: true };
  }
}
`,

  'backend/src/modules/vehicles/vehicles.controller.ts': `
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Vehicles')
@ApiBearerAuth('access-token')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @Roles('motorist', 'admin')
  @ApiOperation({ summary: 'Lister mes véhicules' })
  async findAll(@CurrentUser() user: any) {
    return this.vehiclesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un véhicule' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vehiclesService.findOne(id, user.id);
  }

  @Post()
  @Roles('motorist', 'admin')
  @ApiOperation({ summary: 'Ajouter un véhicule' })
  async create(@Body() createData: any, @CurrentUser() user: any) {
    return this.vehiclesService.create(user.id, createData);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un véhicule' })
  async update(@Param('id') id: string, @Body() updateData: any, @CurrentUser() user: any) {
    return this.vehiclesService.update(id, user.id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.vehiclesService.remove(id, user.id);
  }
}
`,
};

Object.entries(files).forEach(([filePath, content]) => {
  createFile(filePath, content);
});

console.log('\\n? Auth, Users, Vehicles modules created!');
