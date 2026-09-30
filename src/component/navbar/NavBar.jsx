import LogoSmartBin from "../../assets/LogoSmartBin.svg";

const NavBar = () => {
  return (
    <div>
      <a href="https://react.dev" target="_blank">
        <img src={LogoSmartBin} className="logo react" alt="React logo" />
      </a>
    </div>
  );
};

export default NavBar;
