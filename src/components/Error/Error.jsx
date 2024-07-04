import { useContext } from "react";
import { Context } from "./Util/createContext";
import './Error.scss'

export default function Error() {
  const { error } = useContext(Context);

  return <>{error && <div>{error.toString()}</div>}</>;
}
