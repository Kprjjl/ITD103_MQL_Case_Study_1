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
import { useState, useEffect } from "react";

export function DropdownInput({ listItems, getLabelValue, setValue, placeholder, label, search=false, defaultValue="", required=false}) {
  const [searchValue, setSearchValue] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    const filterItems = () => {
      const filtered = search
        ? listItems.filter(item =>
          item.label.toLowerCase().includes(searchValue.toLowerCase())
        )
        : listItems;
      setFilteredItems(filtered);
    };

    filterItems();
  }, [searchValue, listItems, search]);

  return (
    <div>
      <Menu placement="bottom-end" open={openMenu} handler={setOpenMenu}>
        <MenuHandler>
          <div className="relative flex w-full max-w-[24rem]">
            <Input
              placeholder={placeholder}
              label={label}
              value={getLabelValue()}
              defaultValue={defaultValue}
              onChange={() => null}
              required={required}
              icon={<ChevronDownIcon className={`w-5 h-5 transition-transform ${openMenu ? "rotate-180" : ""}`} />}
            />
          </div>
        </MenuHandler>
        <MenuList className="max-h-[20rem] max-w-[18rem]"><>
          {search && (
            <Input
              label="Search"
              containerProps={{ className: "mb-4" }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          )}
          {filteredItems.length === 0 && (
            <MenuItem disabled>
              No applicable items found
            </MenuItem>
          )}
          {filteredItems.map((item, index) => {
            return (
              <MenuItem
                key={index}
                value={item.value}
                onClick={() => {setValue(item.value); setOpenMenu(false);}}
              >
                {item.label}
              </MenuItem>
            );
          })}</>
        </MenuList>
      </Menu>
    </div>
  );
}

DropdownInput.displayName = "/src/widgets/other/DropdownInput.jsx";
