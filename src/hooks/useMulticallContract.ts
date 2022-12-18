import {
  Multicall,
  ContractCallResults,
  ContractCallContext
} from 'ethereum-multicall';

// utils
import { getProvider } from 'src/utils';

const useMulticallContract = async (callData: ContractCallContext) => {
  let provider = await getProvider();

  const multicall = new Multicall({
    ethersProvider: provider,
    tryAggregate: true
  });

  const contractCallContext: ContractCallContext = {
    reference: `${callData.reference}`,
    contractAddress: callData.contractAddress,
    abi: callData.abi,
    calls: callData.calls
  };
  const results: ContractCallResults = await multicall.call(
    contractCallContext
  );

  return results;
};

export default useMulticallContract;
