import axios from 'axios';

const useSendFileToIPFS = async (data: any) => {
  const resFile = await axios({
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
    data: data,
    headers: {
      pinata_api_key: `${process.env.REACT_APP_PINATA_API_KEY}`,
      pinata_secret_api_key: `${process.env.REACT_APP_PINATA_API_SECRET}`,
      'Content-Type': `multipart/form-data; boundary=${data._boundary}`
    }
  });

  return resFile;
};

export const useSendJsonIPFS = async (data: any) => {
  const resJson = await axios({
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    data: data,
    headers: {
      pinata_api_key: `${process.env.REACT_APP_PINATA_API_KEY}`,
      pinata_secret_api_key: `${process.env.REACT_APP_PINATA_API_SECRET}`,
      'Content-Type': ` application/json`
    }
  });

  return resJson;
};

export default useSendFileToIPFS;
