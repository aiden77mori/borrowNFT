import React, { useState, useEffect } from 'react';

// @mui
import {
  Grid,
  Button,
  Box,
  Pagination,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton
} from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AppsIcon from '@mui/icons-material/Apps';

// // hooks
// import useFilter from 'src/hooks/useFilter';

// components
import NFTCard from 'src/components/NFTCard';

// scss
import './NFTList.scss';

function NFTList({ nftList, nftType }: any) {
  const CategoryItemList = ['All', 'Hero', 'Sword', 'Shield', 'Jewel'];
  const [sort, setSort] = useState<number>(1);
  const [perPage, setPerpage] = useState<string>('15');
  const [curPage, setCurPage] = useState<number>(1);
  const [curCategory, setCurCategory] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(1);
  const [filteredNFT, setFilteredNFT] = useState<any>([]);
  const [filterLoading, setFilterLoading] = useState<boolean>(false);
  const [cateNFTCount, setCateNFTCount] = useState<number>(0);
  const [view, setView] = useState<string>('five');

  const filterByCategory = (idx: number) => {
    if (curCategory !== idx) {
      setCurCategory(idx);
      setCurPage(1);
    }
  };
  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    nextView: string
  ) => {
    setView(nextView);
  };
  const handleSortChange = (event: SelectChangeEvent) => {
    setSort(Number(event.target.value));
    setCurPage(1);
  };
  const handlePerPageChange = (event: SelectChangeEvent) => {
    setPerpage(event.target.value);
    setCurPage(1);
  };
  const onPagination = (evt: React.ChangeEvent<any>, page: number) => {
    setCurPage(page);
  };

  useEffect(() => {
    async function init() {
      if (Object.keys(nftList).length > 0) {
        setFilterLoading(true);
        // convert object of object to array object
        let result = Object.keys(nftList).map((key) => {
          let ar = nftList[key];
          ar.key = key;
          return ar;
        });
        // category calcu
        if (curCategory !== 0) {
          result = result.filter(
            (nftInfo: any) => nftInfo.category === CategoryItemList[curCategory]
          );
        }
        // sort
        if (sort !== 0) {
          result = result.slice(0);
          result.sort(function (a, b) {
            if (sort === 1) return a.name > b.name ? 1 : -1;
            else if (sort === 2) return b.name > a.name ? 1 : -1;
            else if (sort === 3) return a.price - b.price;
            else return b.price - a.price;
          });
        }
        const pc = Math.ceil(result.length / Number(perPage));
        setPageCount(pc > 0 ? pc : 1);
        // get result by perPage and curPage
        const indexOfLast = curPage * Number(perPage);
        const indexOfFirst = indexOfLast - Number(perPage);
        result = result.slice(indexOfFirst, indexOfLast);
        setCateNFTCount(result.length);
        setFilteredNFT(result);
      }
      setFilterLoading(false);
    }
    init();

    return () => {
      setFilteredNFT([]);
    };
  }, [curCategory, curPage, sort, perPage, nftList]);

  return (
    <Box className="nftList-section">
      <Card className="category-list-card">
        <Grid
          container
          spacing={{ xs: 1, md: 2 }}
          columns={{ xs: 4, sm: 9, md: 15 }}
          className="category-list"
        >
          {CategoryItemList.map((cTitle, idx) => (
            <Grid item xs={2} sm={3} md={3} key={idx}>
              <Button
                size="small"
                variant={curCategory === idx ? 'contained' : 'outlined'}
                color="primary"
                className="cButton"
                onClick={() => filterByCategory(idx)}
              >
                {cTitle}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Card>
      <Card className="nft-card-list-box">
        <Box className="filter-box">
          <Box className="item-found-box">Results: {cateNFTCount}</Box>
          <Box className="filter-control-group">
            <FormControl
              sx={{ minWidth: 100 }}
              size="small"
              className="item-perPage-form"
            >
              <InputLabel>Per page</InputLabel>
              <Select
                value={perPage}
                label="Per page"
                onChange={handlePerPageChange}
                className="select-box"
              >
                <MenuItem value={15}>15</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={45}>45</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              size="small"
              className="sort-by-form"
              sx={{ minWidth: 150 }}
            >
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sort.toString()}
                onChange={handleSortChange}
                label="Sort by"
                className="select-box"
              >
                <MenuItem value={1}>A - Z</MenuItem>
                <MenuItem value={2}>Z - A</MenuItem>
                <MenuItem value={3}>Lowest Price</MenuItem>
                <MenuItem value={4}>Highest Price</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={handleViewChange}
              className="change-view"
            >
              <ToggleButton value="two" aria-label="two">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="five" aria-label="five">
                <AppsIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        <Grid
          container
          spacing={{ xs: 1 }}
          columns={{
            xs: 2,
            sm: view === 'two' ? 8 : 9,
            md: view === 'two' ? 9 : 8,
            lg: view === 'two' ? 9 : 10
          }}
        >
          {filterLoading ? (
            <>
              {Array(5)
                .fill('object')
                .map((_, idx) => (
                  <Grid
                    item
                    xs={2}
                    sm={view === 'two' ? 4 : 3}
                    md={view === 'two' ? 3 : 2}
                    lg={view === 'two' ? 3 : 2}
                    key={idx}
                  >
                    <Skeleton
                      sx={{ bgcolor: 'grey.900' }}
                      variant="rectangular"
                      height="300px"
                    />
                  </Grid>
                ))}
            </>
          ) : (
            filteredNFT.map((nftItem: any, i: number) => (
              <Grid
                item
                xs={2}
                sm={view === 'two' ? 4 : 3}
                md={view === 'two' ? 3 : 2}
                lg={view === 'two' ? 3 : 2}
                key={i}
              >
                <NFTCard nft={nftItem} nftType={nftType} />
              </Grid>
            ))
          )}
        </Grid>
      </Card>
      <Box className="pagenation-box">
        <Pagination
          count={pageCount}
          page={curPage}
          size="small"
          onChange={(evt, page) => onPagination(evt, page)}
        />
      </Box>
    </Box>
  );
}

export default NFTList;
