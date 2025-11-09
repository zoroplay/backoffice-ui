import React, { FC, ReactNode, FormEvent, FormHTMLAttributes } from "react";

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}

const Form: FC<FormProps> = ({ onSubmit, children, className, ...rest }) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault(); // Prevent default form submission
        onSubmit(event);
      }}
      className={` ${className}`}
      {...rest}
    >
      {children}
    </form>
  );
};

export default Form;
