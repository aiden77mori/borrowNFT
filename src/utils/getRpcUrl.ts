import rn from 'random-number';

// Array of available nodes to connect to
export const nodes = [
  process.env.REACT_APP_NODE_1,
  process.env.REACT_APP_NODE_2,
  process.env.REACT_APP_NODE_3
];

const getRpcUrl = () => {
  const option = {
    min: 0,
    max: nodes.length - 1,
    integer: true
  };
  const randomIndex = rn(option);
  console.log(process.env.REACT_APP_NODE_1);
  return nodes[randomIndex];
};

export default getRpcUrl;
