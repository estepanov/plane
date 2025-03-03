import React from "react";
// headless ui
import { Listbox, Transition } from "@headlessui/react";
// icons
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { CheckIcon } from "@heroicons/react/24/outline";

type CustomSelectProps = {
  value: any;
  onChange: any;
  children: React.ReactNode;
  label?: string | JSX.Element;
  textAlignment?: "left" | "center" | "right";
  maxHeight?: "sm" | "rg" | "md" | "lg" | "none";
  position?: "right" | "left";
  verticalPosition?: "top" | "bottom";
  width?: "auto" | string;
  input?: boolean;
  noChevron?: boolean;
  customButton?: JSX.Element;
  optionsClassName?: string;
  disabled?: boolean;
  selfPositioned?: boolean;
};

const CustomSelect = ({
  children,
  label,
  textAlignment,
  value,
  onChange,
  maxHeight = "none",
  position = "left",
  verticalPosition = "bottom",
  width = "auto",
  input = false,
  noChevron = false,
  customButton,
  optionsClassName = "",
  disabled = false,
  selfPositioned = false,
}: CustomSelectProps) => (
  <Listbox
    as="div"
    value={value}
    onChange={onChange}
    className={`${!selfPositioned ? "relative" : ""} flex-shrink-0 text-left`}
    disabled={disabled}
  >
    <div>
      {customButton ? (
        <Listbox.Button as="div">{customButton}</Listbox.Button>
      ) : (
        <Listbox.Button
          className={`flex w-full ${
            disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-brand-surface-2"
          } items-center justify-between gap-1 rounded-md border border-brand-base shadow-sm duration-300 focus:outline-none ${
            input ? "border-brand-base px-3 py-2 text-sm" : "px-2.5 py-1 text-xs"
          } ${
            textAlignment === "right"
              ? "text-right"
              : textAlignment === "center"
              ? "text-center"
              : "text-left"
          }`}
        >
          {label}
          {!noChevron && !disabled && <ChevronDownIcon className="h-3 w-3" aria-hidden="true" />}
        </Listbox.Button>
      )}
    </div>

    <Transition
      as={React.Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Listbox.Options
        className={`${optionsClassName} absolute border border-brand-base ${
          position === "right" ? "right-0" : "left-0"
        } ${
          verticalPosition === "top" ? "bottom-full mb-1" : "mt-1"
        } z-10 mt-1 origin-top-right overflow-y-auto rounded-md bg-brand-surface-1 text-xs shadow-lg focus:outline-none ${
          width === "auto" ? "min-w-[8rem] whitespace-nowrap" : width
        } ${input ? "max-h-48" : ""} ${
          maxHeight === "lg"
            ? "max-h-60"
            : maxHeight === "md"
            ? "max-h-48"
            : maxHeight === "rg"
            ? "max-h-36"
            : maxHeight === "sm"
            ? "max-h-28"
            : ""
        }`}
      >
        <div className="space-y-1 p-2">{children}</div>
      </Listbox.Options>
    </Transition>
  </Listbox>
);

type OptionProps = {
  children: string | JSX.Element;
  value: any;
  className?: string;
};

const Option: React.FC<OptionProps> = ({ children, value, className }) => (
  <Listbox.Option
    value={value}
    className={({ active, selected }) =>
      `${className} ${active || selected ? "bg-brand-surface-2" : ""} ${
        selected ? "font-medium" : ""
      } cursor-pointer select-none truncate rounded px-1 py-1.5 text-brand-secondary`
    }
  >
    {({ selected }) => (
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">{children}</div>
        {selected && <CheckIcon className="h-4 w-4 flex-shrink-0" />}
      </div>
    )}
  </Listbox.Option>
);

CustomSelect.Option = Option;

export { CustomSelect };
