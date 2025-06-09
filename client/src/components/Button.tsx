import type { ComponentPropsWithRef, FunctionComponent } from "react";

const Button: FunctionComponent<ComponentPropsWithRef<"button"> & {text: string}> = ({text, ...rest}) => {
    return (
      <button
        type="button"
        className="bg-sky-300 text-sky-900 rounded-xs py-0.5 px-1 cursor-pointer shadow hover:shadow-blue-400"
        {...rest}
      >
        {text}
      </button>
    );
};

export default Button;
