export const BASE_URL = 'https://horaservices.com';
export const MEDIA_PROCESSING_BASE_URL = 'https://horaservices.com/media-api';
export const GET_DECORATION_BY_NAME = '/api/Decoration/searchByName/';
export const CONFIRM_ORDER_ENDPOINT = "/api/order/add";
export const SAVE_LOCATION_ENDPOINT='/api/users/address/editByUserID';
export const ADMIN_USER_DETAILS="/api/admin/getUserDetails/";
export const ADMIN_ORDER_LIST="/api/admin/adminOrderList";
export const GET_MEAL_DISH_ENDPOINT = "/api/user/getMealDish";
export const API_SUCCESS_CODE = 200;
export const GET_PHOTOGRAPHY_BY_NAME = "/api/photography/searchByTag/";
export const ADMIN_USER_LIST = '/api/admin/admin_user_list';
export const ADMIN_USER_SIGNUP = '/api/admin/user_signup';

export const ACCEPT_ORDER = "/api/order/acceptOrder";
export const PRODUCT_TYPE = "/api/configuration/admin_configuration_list_all";
export const PRODUCT_MEAL_TYPE = "/api/meals/admin_meals_list";
export const IMAGE_UPLOAD = "/api/decoration_image_upload";
export const ADD_DECORATION_PRODUCT = "/api/dish/add";
export const EDIT_DECORATION_PRODUCT = "/api/decoration/edit";
export const EDIT_PHOTOGRAPHY_PRODUCT = "/api/photography/edit";
export const ADD_PHOTOGRAPHY_PRODUCT = "/api/photography/add";
export const ORDER_EDIT = "/api/order/edit";
export const DRIVE_FOLDER_UPLOAD="/api/photo/drive/import-drive-folder"
export const UPLOAD_DRIVE_TO_ORDER="/api/photo/drive/add-order-drive-link"
export const SAVE_CALL_CHECKLIST = '/api/order/save-call-checklist';
export const UPDATE_CALL_CHECKLIST = '/api/order/edit-call-checklist';
export const MULTI_IMAGE_UPLOAD = '/api/multiple_image_upload'
export const DELETE_CHECKLIST_IMAGE =  '/api/order/delete-callchecklist-image'
export const ACTUAL_IMAGE_BY_NAME="/api/decoration/decorations/"
export const SUPPLIER_PERSONALDETAILS_UPDATE = "api/users/supplier_personal_details_update";

// Food Packages APIs
export const CREATE_FOOD_PACKAGE = "/api/food-package/createFoodPackage";
export const GET_FOOD_PACKAGES = "/api/food-package/admin_food_packages_list";
export const UPDATE_FOOD_PACKAGE = "/api/food-package/updateFoodPackage";
export const ADD_DISH_TO_PACKAGE = "/api/food-package/addDishToPackage";
export const GET_DISHES_FOR_PACKAGE ='/api/dish/getAllDishesList';
export const REMOVE_DISH_FROM_PACKAGE = "/api/food-package/removeDishFromPackage";

// Celebration Boosters APIs
export const CREATE_CELEBRATION_BOOSTER = '/api/celebration-booster/createCelebrationBooster';
export const UPDATE_CELEBRATION_BOOSTER = '/api/celebration-booster/updateCelebrationBooster';
export const GET_CELEBRATION_BOOSTERS = '/api/celebration-booster/adminCelebrationBoosterList';
export const GET_CELEBRATION_BOOSTERS_BY_NAME = '/api/celebration-booster/getCelebrationBoosterByName';

// Decoration Material List APIs
export const GET_DECORATION_MATERIALS = '/api/material-list/admin_material_list';
export const CREATE_DECORATION_MATERIAL = '/api/material-list/createMaterial';
export const UPDATE_DECORATION_MATERIAL = '/api/material-list/updateMaterial';
export const GET_MATERIAL_FILTER_DATA = "/api/material-list/getMaterialFilterData";

// Wonderland tracking routes
export const GET_WONDERLAND_GLOBAL_STATS = '/api/customer/event/all-tracking';
export const GET_WONDERLAND_LISTING_DATA = '/api/customer/event/admin_all_details';
