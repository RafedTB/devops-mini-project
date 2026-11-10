import { Controller, Get, Post, Delete, Param, ParseIntPipe, UseGuards } from "@nestjs/common";
import { FavoritesService } from "./favorites.service";
import { AuthGuard } from "../users/guards/auth.guard";
import { currentUser } from "../users/decorators/current-user.decorator";
import type { JWTPayloadType } from "../utils/types";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags('Favorites')
@Controller('api/favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) {}

    @Get()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user favorites' })
    public getMyFavorites(@currentUser() user: JWTPayloadType) {
        return this.favoritesService.getUserFavorites(user.id);
    }

    @Get('check/:productId')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Check if product is in favorites' })
    public async checkFavorite(
        @Param('productId', ParseIntPipe) productId: number,
        @currentUser() user: JWTPayloadType,
    ) {
        const isFav = await this.favoritesService.isFavorite(user.id, productId);
        return { isFavorite: isFav };
    }

    @Post(':productId')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add product to favorites' })
    public addFavorite(
        @Param('productId', ParseIntPipe) productId: number,
        @currentUser() user: JWTPayloadType,
    ) {
        return this.favoritesService.addFavorite(user.id, productId);
    }

    @Delete(':productId')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Remove product from favorites' })
    public removeFavorite(
        @Param('productId', ParseIntPipe) productId: number,
        @currentUser() user: JWTPayloadType,
    ) {
        return this.favoritesService.removeFavorite(user.id, productId);
    }
}

