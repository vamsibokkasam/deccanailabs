export const DECCO_IMAGE = "/DECCO.jpeg";

function DeccoRobot({ className = "" }) {
  return (
    <img
      src={DECCO_IMAGE}
      alt=""
      className={className}
      draggable={false}
    />
  );
}

export default DeccoRobot;
