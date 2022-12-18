export interface PropertyType {
  attack: number;
  defense: number;
  hp: number;
}
export interface NftType {
  creator: string;
  description: string;
  id: string;
  img_url: string;
  ipfs_url: string;
  name: string;
  owner: string;
  specialty: PropertyType;
  token_id: string;
  type: number;
  price: number;
  owner_img?: string;
}

export interface UserStatType {
  totalNFTs: number;
  activityCount: number;
  ceilPrice: number;
  floorPrice: number;
}

// Anayltic
export interface HeadStatProps {
  totalSupply: number;
  royalty: number;
  minted: number;
  m_minted: number;
  w_minted: number;
  d_minted: number;
  listed: number;
  m_listed: number;
  w_listed: number;
  d_listed: number;
  sold: number;
  m_sold: number;
  w_sold: number;
  d_sold: number;
}

export interface TableChartDataProps {
  mintedNFT: any;
  listedAndRemovedNFT: any;
  soldNFT: any;
}
