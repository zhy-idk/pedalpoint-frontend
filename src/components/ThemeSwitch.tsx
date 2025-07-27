import LightIcon from '../assets/light_mode_24dp.svg?react';
import DarkIcon from '../assets/dark_mode_24dp.svg?react';

import { useTheme } from "../hooks/useTheme";


function ThemeSwitch(){
  const dimension = 18
  const { theme, toggleTheme } = useTheme();
  return(
    <div>
      <label className="toggle text-base-content">
      <input type="checkbox" onChange={toggleTheme} checked={theme === "dark"}/>
      <LightIcon height={dimension} width={dimension}/>
      <DarkIcon height={dimension} width={dimension} fill='black'/>
    </label>
    </div>
  )
}
export default ThemeSwitch