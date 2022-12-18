// style
import "./Card.scss";

interface CardProps {
  imgSrc: string;
  desc: string;
  badgeTitle: string;
  badgetColor: string;
}

function Card(props: CardProps) {
  return (
    <div className="card">
      <img src={props.imgSrc} alt="card-img" className="card-img" />
      <div className="content">
        <div className="nav-content">
          <div className="badge" style={{ background: props.badgetColor }}>
            {props.badgeTitle}
          </div>
          <div className="description">{props.desc}</div>
        </div>
      </div>
    </div>
  );
}

export default Card;
