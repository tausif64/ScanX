import { useEffect } from 'react';

const EmptyComponent = ({ navigation }: any) => {
    useEffect(() => { navigation.navigate('Home'); }, [navigation]);
    return null;
};

export default EmptyComponent;
