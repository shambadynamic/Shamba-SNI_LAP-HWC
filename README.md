# Shamba-SNI Lions Ambassador Patrol (LAP) and Human Wildlife Control (HWC) Data Consumer Smart Contract and External Adapter

1. **ShambaSNIConsumer** is a smart contract designed to request the LAP and HWC data from the **SNI Database** via the Chainlink job specs that are invoking the [Shamba-SNI External Adater Bridge](https://europe-west6-shamba-oracle-services.cloudfunctions.net/shamba-sni-external-adapter) powered by **Shamba Geospatial Oracle**.

2. The request parameters include *category*, *start_date*, *end_date* and *geometry*.

3. While calling the `sendRequest()` function of the smart contract, the parameters need to be passed as:

    **category**: Either `LAP` or `HWC`<br>
    **start_date**: `2015-01-01`<br>
    **end_date**: `2015-01-07`<br>
    **geometry**: `[[1, "[[[34.73409520485825,-0.8926843839661274],[34.73409520485825,-1.8668108116699216],[35.74968860447311,-1.8668108116699216],[35.74968860447311,-0.8926843839661274],[34.73409520485825,-0.8926843839661274]]]"]]`

4. Currently, only the first 10 values are being filtered out from the API interacting with the SNI database (due to the threshold of bytes32 encrypted response of the Chainlink's jobSpecs). But, all the data is getting stored onto IPFS, and the corresponsing `cid` can also be retrieved using the `getCid()` and `getLatestCid()` functions of the smart contract accordingly.

5. In case of **LAP**, there are a total of 1453 records. So, the first 10 *dataId* and *recordWhat* values are being fetched. 

6. The lists of *dataId* and *recordWhat* values are given as:

    **dataId**: `[205,206,207,208,209,210,211,212,0,279]`

    **recordWhat**: `["Livestock","Livestock","People","Conflict boma","Livestock","Livestock","People","People","People","Herbivores"]`

7. In case of **HWC**, there are a total of 8 records. So, all the *dataId* and *predator* values are being fetched. 

8. The lists of *dataId* and *predator* values are given as:

    **dataId**: `[0,1,2,3,4,5,6,7]`

    **predator**: `["Other","Spotted hyaena","Spotted hyaena","Jackal","Jackal","Spotted hyaena","Lion","Spotted hyaena"]`

9. While calling the `getRecordWhat()` function, the `dataId` paramter value needs to be passed. The value can be referred from the list mentioned in point **6**.

10. While calling the `getPredator()` function, the `dataId` paramter value needs to be passed. The value can be referred from the list mentioned in point **8**.