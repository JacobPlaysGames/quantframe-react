import { Group, NumberInput } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftRight, faInfinity } from "@fortawesome/free-solid-svg-icons";
import styles from "./MinMax.module.css";
import { useEffect, useState } from "react";

export type MinMaxProps = {
  value: { min?: number | undefined; max?: number | undefined } | undefined;
  minAllowed?: number;
  maxAllowed?: number;
  label: string;
  description?: string;
  onChange: (value: { min?: number | undefined; max?: number | undefined } | undefined) => void;
};

export function MinMax({ value, label, description, minAllowed, maxAllowed, onChange }: MinMaxProps) {
  const [minMax, setMinMax] = useState<{ min?: number; max?: number }>({
    min: value?.min,
    max: value?.max,
  });
  useEffect(() => {
    const copy = { ...minMax };
    if (copy.max == null) copy.max = undefined;
    if (copy.min == null) copy.min = undefined;
    if (copy.min == undefined && copy.max == undefined) return onChange(undefined);
    onChange(copy);
  }, [minMax]);
  return (
    <Group gap={"sm"}>
      <NumberInput
        value={minMax.min}
        w={"100px"}
        min={minAllowed}
        max={maxAllowed}
        onChange={(n) => {
          if (n === "") setMinMax({ ...minMax, min: undefined });
          else setMinMax({ ...minMax, min: Number(n) });
        }}
        label={label}
        description={description}
        placeholder="0"
      />
      <FontAwesomeIcon icon={faLeftRight} style={{ marginTop: 23 }} />
      <NumberInput
        mt={23}
        w={"100px"}
        value={minMax.max}
        min={minAllowed}
        max={maxAllowed}
        onChange={(n) => {
          if (n === "") setMinMax({ ...minMax, max: undefined });
          else setMinMax({ ...minMax, max: Number(n) });
        }}
        placeholder="No limit"
        rightSection={!value?.max && value?.max !== 0 ? <FontAwesomeIcon icon={faInfinity} className={styles.infinityIcon} /> : undefined}
      />
    </Group>
  );
}
