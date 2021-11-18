import React, {
  useState,
  FunctionComponent,
  ChangeEvent
} from 'react';
import cn from 'classnames';
import { debounce } from 'lodash';

import { geoAdminApi, Location } from '../../services';

const getLocations = debounce((searchText: string, cb: (results: Location[]) => void) => {
  geoAdminApi
    .search(searchText)
    .then(({ data }) => cb(data.results));
}, 600, { trailing: true, leading: false });

export const Search: FunctionComponent<{
  className?: string,
  onFound?: (location: Location) => void,
}> = ({
  className,
  onFound = () => {},
}) => {
  const [searchText, setSearchText] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);

    if (event.target.value.length < 4) return setLocations([]);

    getLocations(event.target.value, (results) => setLocations(results));
  }

  const handleClick = (location: Location) => {
    onFound(location);
    setSearchText(location.attrs.label.replace(/[<b>|</b>]/g, ''));
    setLocations([]);
  }

  const clearInput = () => {
    setSearchText('');
    setLocations([]);
  }

  return (
    <section
      className={cn([
        className,
        'dropdown',
      ])}
    >
      <div className="input-group">
        <span className="input-group-text">📍</span>
        <input
          type="text"
          className="form-control dropdown-toggle"
          onChange={handleChange}
          value={searchText}
          placeholder="Address, zipcode or cadastral number"
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={clearInput}
        >
          ❌
        </button>
      </div>
      <ul className={cn({
        'dropdown-menu w-100': true,
        'show': locations.length,
      })}>
        { locations.map((location) => (
          <li key={location.id}>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => handleClick(location)}
            >
              <span
                className="text-truncate"
                dangerouslySetInnerHTML={{__html: location.attrs.label }}
              />
            </button>
          </li>
        )) }

      </ul>
    </section>
  );
}
