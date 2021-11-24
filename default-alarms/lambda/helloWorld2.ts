
export const handler = async (event: any = {}, context: any = {}): Promise<any> => {

    //record result

    const response = JSON.stringify(event, null, 2);
    return response;
};
