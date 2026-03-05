import { 
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlantDataService } from './plant-data.service';
import { CreatePlantDataDto } from './dto/create-plant-data.dto';
import { UpdatePlantDataDto } from './dto/update-plant-data.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('plant-data')
@Controller('plant-data')
@UseGuards(JwtAuthGuard)
export class PlantDataController {
  constructor(private readonly plantDataService: PlantDataService) {}

  @Get()
  @ApiOperation({ summary: 'Get all plant data records with pagination and filtering' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Records retrieved successfully' })
  async getAllPlantDatas(@Query() paginationQuery: PaginationQueryDto) {
    return await this.plantDataService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get plant data record by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record found' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Record not found' })
  async getPlantDataById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.plantDataService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new plant data record' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Record created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  async createPlantData(@Body() createPlantDataDto: CreatePlantDataDto) {
    return await this.plantDataService.create(createPlantDataDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update plant data record' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Record not found' })
  async updatePlantData(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePlantDataDto: UpdatePlantDataDto,
  ) {
    return await this.plantDataService.update(id, updatePlantDataDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete plant data record' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Record deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Record not found' })
  async deletePlantData(@Param('id', ParseUUIDPipe) id: string) {
    await this.plantDataService.delete(id);
    return { statusCode: HttpStatus.NO_CONTENT };
  }

  @Get('plot/:plotId')
  @ApiOperation({ summary: 'Get plant data records by plot ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Records retrieved successfully' })
  async getPlantDataByPlotId(
    @Param('plotId', ParseUUIDPipe) plotId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return await this.plantDataService.findByPlotId(plotId, paginationQuery);
  }

  @Get('latest/plot/:plotId')
  @ApiOperation({ summary: 'Get latest plant data record for a plot' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Latest record retrieved' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'No records found' })
  async getLatestPlantDataForPlot(@Param('plotId', ParseUUIDPipe) plotId: string) {
    return await this.plantDataService.findLatestByPlotId(plotId);
  }
}