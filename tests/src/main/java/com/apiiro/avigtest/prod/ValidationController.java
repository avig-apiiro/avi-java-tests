package com.sofi.usps.controllers;

import com.sofi.usps.UspsAddressService;
import com.sofi.usps.exception.UspsException;
import com.sofi.usps.model.dto.AddressDTO;

import com.sofi.models.usps.UspsAddress;

import io.swagger.annotations.ApiOperation;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import javax.inject.Inject;
import javax.validation.Valid;
import javax.validation.constraints.Size;

/**
 *
 * @author adispennette
 *
 */
@Slf4j
@Data
@RequiredArgsConstructor(onConstructor_ = {
        @Inject
})
@RestController
@CrossOrigin(exposedHeaders = "errors, content-type")
@RequestMapping(path = {
        "/api/v1/usps/verification"
})
@Validated
public class ValidationController {
    private final UspsAddressService uspsAddressService;

    @ApiOperation(value = "Verify that the provided addresses are valid")
    @PostMapping(value = "/address", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<?> addressVerification(@Valid @RequestBody @Size(max = 5) Collection<AddressDTO> addresses) {
        log.trace("starting address verification.");
        List<UspsAddress> uspsAddresses = mapToUspsAddress(addresses);
        try {
            List<UspsAddress> uspsAddressResults = uspsAddressService.verifyAddress(uspsAddresses);
            return new ResponseEntity<>(mapToAddressDTO(uspsAddressResults), HttpStatus.OK);
        } catch (UspsException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @ApiOperation(value = "verify that the city and state for each address is valid")
    @PostMapping(value = "/city-state", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<?> cityStateVerification(@Valid @RequestBody @Size(max = 5) Collection<AddressDTO> addresses) {
        log.trace("starting city state verification.");
        List<UspsAddress> uspsAddresses = mapToUspsAddress(addresses);
        try {
            List<UspsAddress> uspsAddressResults = uspsAddressService.verifyCityState(uspsAddresses);
            return new ResponseEntity<>(mapToAddressDTO(uspsAddressResults), HttpStatus.OK);
        } catch (UspsException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @ApiOperation(value = "Determine whether or not the address is a PO Box")
    @PostMapping(value = "/isPOBox", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<?> isAddressPOBox(@Valid @RequestBody AddressDTO address) {
        log.trace("determining if address is a PO Box.");
        Boolean isPoBox = uspsAddressService.isAddressPOBox(new UspsAddress(address.getLineOne(), address.getLineTwo(), address.getCity(),
                address.getState(), address.getZip(), address.getPlusFour()));
        return new ResponseEntity<>(isPoBox, HttpStatus.OK);
    }

    @ApiOperation(value = "verify that the postal codes are valid for the provided addresses")
    @PostMapping(value = "/zip/", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity<?> verifyZipCode(@Valid @RequestBody @Size(max = 5) Collection<AddressDTO> addresses) {
        log.trace("starting postal code verification.");
        List<UspsAddress> uspsAddresses = mapToUspsAddress(addresses);
        try {
            List<UspsAddress> uspsAddressResults = uspsAddressService.verifyZipCode(uspsAddresses);
            return new ResponseEntity<>(mapToAddressDTO(uspsAddressResults), HttpStatus.OK);
        } catch (UspsException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    private List<AddressDTO> mapToAddressDTO(List<UspsAddress> uspsAddressResults) {
        List<AddressDTO> results = new ArrayList<>();
        for (UspsAddress addy : uspsAddressResults) {
            AddressDTO validated = new AddressDTO();
            validated.setLineOne(addy.getAddress1());
            validated.setLineTwo(addy.getAddress2());
            validated.setCity(addy.getCity());
            validated.setState(addy.getState());
            validated.setZip(addy.getZip5());
            validated.setPlusFour(addy.getZip4());
            results.add(validated);
        }
        return results;
    }

    private List<UspsAddress> mapToUspsAddress(Collection<AddressDTO> addresses) {
        List<UspsAddress> uspsAddresses =
                addresses.stream()
                        .map(a -> new UspsAddress(a.getLineOne(), a.getLineTwo(), a.getCity(), a.getState(), a.getZip(), a.getPlusFour()))
                        .collect(Collectors.toList());
        return uspsAddresses;
    }

}