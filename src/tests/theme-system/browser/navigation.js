import {useEffect} from 'react';
const navigation={navigate(){}};
export const useNavigation=()=>navigation;
export const useFocusEffect=callback=>useEffect(callback,[callback]);
