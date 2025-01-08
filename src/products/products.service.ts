import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ShopifyService } from 'src/shopify/shopify.service';

@Injectable()
export class ProductsService {
  constructor(private readonly shopifyService: ShopifyService) {}

  async findAll() {
    const query = `
    query ($cursor: String) {
      products(first: 50, after: $cursor) {
        edges {
          cursor
          node {
            id
            title
            productType
            descriptionHtml
            totalInventory
            options {
              id
              name
              values
            }
            images(first: 5) {
              edges {
                node {
                  id
                  altText
                  url
                }
              }
            }

            variants(first: 5) {
              edges {
                node {
                availableForSale
                  id
                  price
                  title
                  image{
                    url
                  }
                }
              }
            }
              variantsCount {
        count
      }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;
  

    try {
      const response = await this.shopifyService.executeGraphQL(query);
      console.log(response);
      // Validate response structure
      if (!response || !response.data || !response.data.products) {
        throw new InternalServerErrorException(
          'Failed to fetch products from Shopify',
        );
      }

      return response.data.products.edges.map((edge) => edge.node);
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching products',
      );
    }
  }

  async findOne(productId: number) {
    const query = `
      query ($id: ID!) {
        product(id: $id) {
          id
          title
          descriptionHtml
          totalInventory
          images(first: 250) {
            edges {
              node {
                id
                altText
                url
              }
            }
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                price
              }
            }
          }
        }
      }
    `;

    // Construct the full `gid` for the product
    const productGID = `gid://shopify/Product/${productId}`;

    try {
      const response = await this.shopifyService.executeGraphQL(query, {
        id: productGID,
      });

      console.log('GraphQL Response:', response); // Log the full response for debugging

      // Validate response structure

      return response.data.product;
    } catch (error) {
      console.error('Error fetching product:', error); // Log the error for debugging
      throw new Error(
        `An error occurred while fetching product: ${error.message}`,
      );
    }
  }
}
