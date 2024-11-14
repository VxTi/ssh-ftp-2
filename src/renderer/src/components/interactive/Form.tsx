/**
 * @fileoverview Form.tsx
 * @author Luca Warmenhoven
 * @date Created on Monday, November 04 - 00:19
 */
import { CSSProperties, FormEvent, ReactNode, useState } from "react";
import { CheckIcon }                                     from "lucide-react";

export interface FormProps {
    children: ReactNode
    style?: CSSProperties
    className?: string,
    onSubmit?: (event: FormEvent<HTMLFormElement>) => void
}

export function Form(props: FormProps) {
    return (
        <form className={`flex text-sm flex-col justify-start items-stretch gap-2 ${props.className ?? ''}`}
              style={props.style}
              onSubmit={props.onSubmit}>
            {props.children}
        </form>
    )
}

export function FormRow(props: { children: ReactNode, className?: string }) {
    return (
        <div className={`flex flex-row justify-start gap-1 ${props.className ?? 'items-center'}`}>
            {props.children}
        </div>
    )
}

export function FormInput(props: any) {
    return (
        <input
            type={props.type ?? 'text'}
            {...props}
            placeholder={props.placeholder ?? props.label ?? ''}
            className={`py-1 px-2 placeholder-text-secondary rounded-md grow focus:outline-none bg-secondary border-[1px] border-solid border-primary focus:border-theme-special ${props.className ?? ''}`}
            onChange={(e) => props.onChange?.(e.target.value)}/>
    )
}

export function FormCheckbox(props: any) {

    const [ checked, setChecked ] = useState(false);

    return (
        <label className="flex flex-row items-center gap-2">
            <div className="relative flex place-items-center">
                <input type="checkbox"
                       {...props}
                       className={`rounded-md appearance-none w-4 h-4 bg-secondary border-[1px] border-solid border-primary focus:outline-theme-special ${props.className ?? ''}`}
                       onChange={(e) => {
                           setChecked(e.target.checked);
                           props.onChange?.(e.target.checked)
                       }}/>
                {checked && (
                    <CheckIcon className="absolute left-0 top-0 w-full h-full text-special"/>
                )}
            </div>
            <span className="select-none">{props.label}</span>
        </label>
    )
}

export function FormTextArea(props: any) {
    return (
        <textarea
            {...props}
            placeholder={props.placeholder ?? props.label ?? ''}
            className={`py-1 px-2 placeholder-text-secondary rounded-md grow focus:outline-none bg-secondary border-[1px] border-solid border-primary focus:border-theme-special ${props.className ?? ''}`}
            onChange={(e) => props.onChange?.(e.target.value)}/>
    )
}