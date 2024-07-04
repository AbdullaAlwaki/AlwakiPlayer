import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../Util/createContext";
import "./Login.scss";


export default function LoginWithUrl() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { setError, setLoading, setName } = useContext(Context);
  const navigat = useNavigate()

  // const handleKeyDown = (event) => {
  //   if (isSelected === 1) {
  //     switch (event.key) {
  //       case "ArrowDown":
  //         setSelectedIndex((prevIndex) =>
  //           prevIndex < 2 ? prevIndex + 1 : prevIndex
  //         );
  //         break;
  //       case "ArrowUp":
  //         setSelectedIndex((prevIndex) =>
  //           prevIndex > 0 ? prevIndex - 1 : prevIndex
  //         );
  //         break;
  //       case "Enter":
  //         if (selectedIndex === 2) {
  //           // inputRefs.current[2].click();
  //         }
  //         break;
  //       default:
  //         break;
  //     }
  //   } else {
  //     setSelectedIndex(null);
  //   }
  // };

  const onSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const url = e.target.url.value;
    const name = e.target.Name.value;

    if (!url || !name) {
      setError("Please fill all the fields");
      setLoading(false);
      return;
    }

    if (!url.includes("get.php")) {
      setError("Invalid URL");
      setLoading(false);
      return;
    }

    const urlArr = url.split("/get.php?");
    const params = urlArr[1].split("&");
    const obj = {};
    params.forEach((param) => {
      const [key, value] = param.split("=");
      obj[key] = value;
    });

    setName(name);
    fetch(
      `${urlArr[0]}/player_api.php?username=${obj.username}&password=${obj.password}&action=user_info`
    )
      .then((response) => response.json())
      .then((data) => {
          if (data.user_info.auth === 1) {
            let userData = JSON.parse(localStorage.getItem("user"));
            if (userData) {
              userData.push({...data, profile: name});
              localStorage.setItem("user", JSON.stringify(userData));
              setLoading(false);
              setError(null);
              navigat("/")
            } else {
              localStorage.setItem(
                "user",
                JSON.stringify([{ ...data, profile: name }])
              );
              setLoading(false);
              setError(null);
              navigat("/")
            }

        } else {
          setLoading(false);
          setError("Invalid URL");
        }
      })
      .catch((error) => setError(error));
  };

  const getClassName = (index) => {
    if (index === 2) {
      return selectedIndex === 2 ? "selected_submit" : "";
    } else {
      return selectedIndex === index ? "selected_input" : "";
    }
  };

  const cc = (e)=>{
    console.log(e);
  }

  return (
    <div className="loginWithUrl">
      <form className="login-with-url" onSubmit={onSubmit}>
        <h3>login with your server url</h3>
        <div className={getClassName(0)} onKeyDown={cc}>
          <input
            type="text"
            id="Name"
            placeholder="Your Playlist Name"
          />
        </div>
        <div className={getClassName(1)}>
          <input
            type="text"
            id="url"
            placeholder="Your server url"
          />
        </div>
        <div className={getClassName(2)}>
          <button>Save Login</button>
        </div>
      </form>
    </div>
  );
}
