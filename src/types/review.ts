export interface Review {
  id: string;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
  notHelpful: number;
  verifiedPurchase: boolean;
}