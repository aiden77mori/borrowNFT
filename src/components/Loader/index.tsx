import "./Loader.scss";

const Loader = () => {
  return (
    <div className="loading-spinner">
      <div className="inner-spinner">
        <div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
