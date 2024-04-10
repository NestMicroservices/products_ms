import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database Connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto });
  }

  async findAll({ limit, page }: PaginationDto) {
    const total = await this.product.count({ where: { available: true } });
    const lastPage = Math.ceil(total / limit);
    return {
      data: await this.product.findMany({
        skip: (page - 1) * 10,
        take: limit,
        where: { available: true },
      }),
      meta: { total: total, page: page, lastPage: lastPage },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true },
    });

    if (!product) {
      throw new RpcException(`Product whith #${id} not found`);
    }

    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...rest } = updateProductDto;
    await this.findOne(id);
    return this.product.update({ where: { id }, data: rest });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.product.update({ where: { id }, data: { available: false } });
  }
}
