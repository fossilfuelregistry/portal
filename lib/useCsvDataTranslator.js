import React from "react"
import useText from "lib/useText"

const useCsvDataTranslator = () => {
    const { getText } = useText()

    const generateCsvTranslation = data => {
        const prefix = "csv_key_";
        const keys = Object.keys(data);
        const obj = {}

        keys.forEach(key=>{
            switch(key.toLowerCase()){
                case "fuel":
                case "fossilfueltype":
                    obj[getText(`fossil_fuel_type`)] = getText(data[key])
                    break
                    
                case "scenario":
                    obj[getText(`${prefix}${key}`) || key] = getText(data[key])
                    break

                case "oil":
                case "gas":
                case "coal":
                    obj[getText(key)] = data[key]
                    break

                default:
                    obj[getText(`${prefix}${key}`) || key] = data[key]
                    break
            }
        })
        return obj
    }
    return { generateCsvTranslation }
}

export default useCsvDataTranslator
