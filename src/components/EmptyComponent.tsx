import { useEffect } from "react";

const EmptyComponent = ({ navigation }: any) => {
    useEffect(() => { navigation.navigate('/') }, [])
    return null;
}

export default EmptyComponent;