import { faArrowRightArrowLeft, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Leg, PutCall, Side } from "../../../common/models/trade";
import DateInput from "../../shared/dateInput";

const invertSides = (legs: Leg[], setLegs) => {
  const newLegs = legs.map((leg) => {
    return {
      ...leg,
      side: leg.side === Side.Buy ? Side.Sell : Side.Buy
    };
  });

  setLegs(newLegs);
};

const invertOptions = (legs: Leg[], setLegs) => {
  const newLegs = legs.map((leg) => {
    return {
      ...leg,
      putCall: leg.putCall === PutCall.Call ? PutCall.Put : PutCall.Call
    };
  });

  setLegs(newLegs);
};

const incrementQuantity = (legs, setLegs, value = 1) => {
  const newLegs = legs.map((leg) => {
    return {
      ...leg,
      quantity: Math.max(1, leg.quantity + value)
    };
  });

  setLegs(newLegs);
};

const AdjustButton = ({ adjustFunction, icon = faArrowRightArrowLeft }) => {
  return (
    <FontAwesomeIcon icon={icon} onClick={adjustFunction} className="adjust-icon" />
  );
};

const DeleteLeg = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  button {
    height: 30px;
  }
`;

const InputGroup = styled.div`
  .adjust-icon {
    margin-right: 1ch;
    padding-top: 3px;
    float: right;
    font-size: 12px;

    &:hover {
      color: #8b949e;
      cursor: pointer;
      text-align: right;
    }
  }
`;

const LegInputGroup = ({ index, legs, setLegs, isShares, close, closed }) => {
  const leg: Leg = legs[index];

  const [strikeStr, setStrikeStr] = useState("");
  const [openPriceStr, setOpenPriceStr] = useState("");
  const [closePriceStr, setClosePriceStr] = useState("");

  useEffect(() => {
    if (!isNaN(leg.strike)) {
      setStrikeStr(leg.strike.toString());
    }
    if (!isNaN(leg.openPrice)) {
      setOpenPriceStr(leg.openPrice.toString());
    }
    if (!isNaN(leg.closePrice) && leg.closePrice) {
      setClosePriceStr(leg.closePrice.toString());
    }
  }, [leg.closePrice, leg.expiration, leg.openPrice, leg.strike]);

  const updateLegs = (leg) => {
    const newLegs = [...legs];
    newLegs.splice(index, 1, leg);
    setLegs(newLegs);
  };

  const onSideChange = (e) => {
    const side = Side[e.target.value];
    updateLegs({ ...leg, side });
  };

  const onOptionChange = (e) => {
    const putCall = PutCall[e.target.value];
    updateLegs({ ...leg, putCall });
  };

  const onQuantityChange = (e) => {
    const quantity = e.target.valueAsNumber;
    updateLegs({ ...leg, quantity });
  };

  const onExpirationChange = (e) => {
    const expiration = e;
    updateLegs({ ...leg, expiration });
  };

  const onStrikeChange = (e) => {
    const strStr = e.target.value;

    const regexp = new RegExp("^\\d*\\.?\\d*$");
    const isValid = regexp.test(strStr);

    if (!isValid) {
      return;
    }

    const strike = Number.parseFloat(strStr);

    setStrikeStr(strStr);
    updateLegs({ ...leg, strike });
  };

  const onOpenPriceChange = (e) => {
    const priceStr = e.target.value;

    const regexp = new RegExp("^-?\\d*\\.?\\d*$");
    const isValid = regexp.test(priceStr);

    if (!isValid) {
      return;
    }

    const openPrice = Number.parseFloat(priceStr);

    setOpenPriceStr(priceStr);
    updateLegs({ ...leg, openPrice: openPrice });
  };

  const onClosePriceChange = (e) => {
    const priceStr = e.target.value;

    const regexp = new RegExp("^-?\\d*\\.?\\d*$");
    const isValid = regexp.test(priceStr);

    if (!isValid) {
      return;
    }

    const closePrice = Number.parseFloat(priceStr);

    setClosePriceStr(priceStr);
    updateLegs({ ...leg, closePrice: closePrice });
  };

  const onDelete = (e) => {
    e.preventDefault();

    if (legs.length > 1) {
      setLegs(legs.filter((l, i) => index !== i));
    }
  };

  return (
    <InputGroup className="d-flex">
      {/* Side */}
      <div>
        {index === 0 && <label>Side<AdjustButton adjustFunction={() => invertSides(legs, setLegs)} /></label>}
        <select value={leg.side} onChange={onSideChange} disabled={close}>
          {Object.keys(Side).map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>

      {/* Put or call */}
      {!isShares && (
        <div>
          {index === 0 && <label>Option<AdjustButton adjustFunction={() => invertOptions(legs, setLegs)} /></label>}
          <select value={leg.putCall} onChange={onOptionChange} disabled={close}>
            {Object.keys(PutCall).map(key => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>
      )}

      {/* Quantity */}
      <div>
        {index === 0 && (
          <label>Quantity
            <span>
              <AdjustButton icon={faPlus} adjustFunction={() => incrementQuantity(legs, setLegs)} />
              <AdjustButton icon={faMinus} adjustFunction={() => incrementQuantity(legs, setLegs, -1)} />
            </span>
          </label>
        )}
        <input type="number" min="1" step="1" value={leg.quantity} onChange={onQuantityChange} disabled={close} />
      </div>

      {!isShares && (
        <>
          {/* Expiration date */}
          <div>
            {index === 0 && <label>Expiration</label>}
            <DateInput value={leg.expiration} onChange={onExpirationChange} clearIcon={null} disabled={close} />
          </div>

          {/* Strike */}
          <div>
            {index === 0 && <label>Strike</label>}
            <input type="text" value={strikeStr} onChange={onStrikeChange} disabled={close} />
          </div>
        </>
      )}

      {/* Open Price */}
      <div>
        {index === 0 && <label>Open price</label>}
        <input type="text" value={openPriceStr} onChange={onOpenPriceChange} disabled={close} />
      </div>

      {/* Close Price */}
      {(close || closed) && (
        <div>
          {index === 0 && <label>Close price</label>}
          <input type="text" value={closePriceStr} onChange={onClosePriceChange} />
        </div>
      )}

      {/* Delete leg button */}
      {!(close || isShares) && (
        <DeleteLeg>
          <button className="btn-red" onClick={onDelete} disabled={legs.length === 1}>
            <FontAwesomeIcon icon={faMinus} />
          </button>
        </DeleteLeg>
      )}
    </InputGroup>
  );
};

export default LegInputGroup;