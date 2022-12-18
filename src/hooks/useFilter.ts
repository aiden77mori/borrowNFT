import { useState, useEffect } from 'react';
import { SelectChangeEvent } from '@mui/material/Select';

const useFilter = ({ nftList }: any) => {
  const CategoryItemList = ['All', 'Hero', 'Sword', 'Shield', 'Jewel'];
  const [sort, setSort] = useState<string>('');
  const [perPage, setPerpage] = useState<string>('15');
  const [curPage, setCurPage] = useState<number>(1);
  const [curCategory, setCurCategory] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(1);
  const [filteredNFT, setFilteredNFT] = useState<any>({});
  const [filterLoading, setFilterLoading] = useState<boolean>(false);

  const filterByCategory = (idx: number) => {
    if (curCategory !== idx) {
      setCurCategory(idx);
      setCurPage(1);
    }
  };
  const handleSortChange = (event: SelectChangeEvent) => {
    setSort(event.target.value);
  };
  const handlePerPageChange = (event: SelectChangeEvent) => {
    setPerpage(event.target.value);
  };
  const onPagination = (evt: React.ChangeEvent<any>, page: number) => {
    setCurPage(page);
  };

  useEffect(() => {
    async function init() {
      console.log(nftList);
      if (nftList) {
        setFilterLoading(true);
        // convert object of object to array object
        let result = Object.keys(nftList).map((key) => {
          let ar = nftList[key];
          ar.key = key;
          return ar;
        });
        // category calcu
        if (curCategory !== 0) {
          result = await nftList.filter(
            (nftInfo: any) => nftInfo.category === CategoryItemList[curCategory]
          );
        }
        // sort
        if (sort) {
          result = result.slice(0);
          result.sort(function (a, b) {
            if (sort === 'Highest') return a.name - b.name;
            else if (sort === 'Lowest') return b.name - a.name;
            // else if (sort === 'Name') return
          });
        }
        // current page and limit per page
        const indexOfLast = curPage * Number(perPage);
        const indexOfFirst = indexOfLast - Number(perPage);
        result = result.slice(indexOfFirst, indexOfLast);
        setPageCount(Math.ceil(result.length / Number(perPage)));

        setFilteredNFT(result);
      }
      setFilterLoading(false);
    }
    init();
  }, [curCategory, curPage, sort, perPage, nftList]);

  return {
    sort,
    perPage,
    curCategory,
    curPage,
    pageCount,
    filterLoading,
    filteredNFT,
    CategoryItemList,
    filterByCategory,
    handleSortChange,
    handlePerPageChange,
    onPagination
  };
};

export default useFilter;
