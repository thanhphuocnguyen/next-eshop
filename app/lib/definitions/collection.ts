import { GeneralCategoryModel } from './category';
import { ManageProductModel } from './product';

export type CollectionDetailModel = GeneralCategoryModel & {
  products: ManageProductModel[];
};
