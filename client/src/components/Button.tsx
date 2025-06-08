import type { ComponentPropsWithRef, FunctionComponent } from "react";

const Button: FunctionComponent<ComponentPropsWithRef<"button"> & {text: string}> = ({text, ...rest}) => {
    return <button type="button" className="bg-blue-700 text-slate-900 rounded-xs p-0.5 cursor-pointer hover:bg-blue-500" {...rest}>
      {text}
  </button>;
};

export default Button;
