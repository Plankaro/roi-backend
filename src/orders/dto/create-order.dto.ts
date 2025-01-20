export class CreateOrderDto {
  Items: [
    {
      productId: string;
      quantity: number;
    },
  ];
  customerId: string;
}
