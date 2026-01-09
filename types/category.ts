export type category = {
  id: number;
  name: string;
  name_slug: string;
  show_on_menu: number;
  category_order: number;
  block_type: string;
  show_at_homepage: number;
  color:string;
  parent:any;
};

export type catgeorypropType = {
  item: category;
};
