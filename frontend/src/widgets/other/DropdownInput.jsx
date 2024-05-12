import React from "react";
import {
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  IconButton,
} from "@material-tailwind/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export function DropdownInput({ listItems, value, setValue, placeholder, label, chevronPosition="end" }) {
  return (
    <div>
      <Menu placement="bottom-end">
        <MenuHandler>
        <div className="relative flex w-full max-w-[24rem]">
          {chevronPosition === "start" && (
            <>
            <IconButton
              ripple={false}
              color="blue-gray"
              size="regular"
              variant="text"
            >
              {/* chevrondownicon with blue-gray color */}
              <ChevronDownIcon className="w-5 h-5" />
            </IconButton>
            <Input
              placeholder={placeholder}
              label={label}
              value={value}
              onChange={() => null}
            />
            </>
          )}
          {chevronPosition === "end" && (
            <>
            <Input
              placeholder={placeholder}
              label={label}
              value={value}
              onChange={() => null}
            />
            <IconButton
              ripple={false}
              color="blue-gray"
              size="regular"
              variant="text"
            >
              {/* chevrondownicon with blue-gray color */}
              <ChevronDownIcon className="w-5 h-5" />
            </IconButton>
            </>
          )}
          
          </div>
        </MenuHandler>
        <MenuList className="max-h-[20rem] max-w-[18rem]">
          {listItems.map((item, index) => {
            return (
              <MenuItem
                key={item}
                value={item}
                onClick={() => setValue(item)}
              >
                {item}
              </MenuItem>
            );
          })}
        </MenuList>
      </Menu>
    </div>
  );


  // return (
  //   <div className="relative flex w-full max-w-[24rem]">
  //     <Menu placement="bottom-start">
  //       <MenuHandler>
  //         <IconButton
  //           ripple={false}
  //           color="blue-gray"
  //           size="regular"
  //           variant="solid"
  //           // className="rounded-l-none"
  //         >
  //           <ChevronDownIcon className="w-5 h-5" />
  //         </IconButton>
  //       </MenuHandler>
  //       <MenuList className="max-h-[20rem] max-w-[18rem]">
  //         {listItems.map((item, index) => {
  //           return (
  //             <MenuItem
  //               key={item}
  //               value={item}
  //               onClick={() => setValue(index)}
  //             >
  //               {item}
  //             </MenuItem>
  //           );
  //         })}
  //       </MenuList>
  //     </Menu>
  //     <Input
  //       type="tel"
  //       placeholder={placeholder}
  //       className="rounded-l-none !border-t-blue-gray-200 focus:!border-t-gray-900"
  //       labelProps={{
  //         className: "before:content-none after:content-none",
  //       }}
  //       containerProps={{
  //         className: "min-w-0",
  //       }}
  //       value={value}
  //     />
  //   </div>
  // );
}

DropdownInput.displayName = "/src/widgets/other/DropdownInput.jsx";
