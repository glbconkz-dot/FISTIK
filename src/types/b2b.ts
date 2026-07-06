export interface B2BBranch {
  id: string;
  customer_id: string;
  branch_name: string;
  address: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
}

export interface B2BCustomer {
  id: string;
  company_name: string;
  director_name: string;
  inn: string;
  legal_address: string;
  phone: string;
  phone_alt: string;
  is_active: boolean;
  terms_accepted_at: string | null;
  discount_tier: 0 | 3 | 6;
  created_at: string;
  updated_at: string;
}

export interface B2BCustomerWithBranches extends B2BCustomer {
  branches: B2BBranch[];
}

export interface B2BBranchInput {
  branchName: string;
  address: string;
  isDefault?: boolean;
}

export interface B2BCustomerInput {
  companyName: string;
  directorName: string;
  inn: string;
  legalAddress: string;
  phone: string;
  phoneAlt: string;
  password: string;
  branches: B2BBranchInput[];
}

export interface B2BProductPrice {
  id: string;
  product_id: string;
  price: number;
  created_at: string;
  updated_at: string;
}
