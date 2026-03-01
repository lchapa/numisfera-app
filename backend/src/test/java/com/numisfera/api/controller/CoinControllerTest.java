package com.numisfera.api.controller;

import com.numisfera.api.model.Coin;
import com.numisfera.api.service.CoinService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CoinController.class)
public class CoinControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CoinService coinService;

    private Coin coin1;
    private Coin coin2;

    @BeforeEach
    public void setup() {
        coin1 = new Coin(1L, "Centenario", "Mexico", 1921, "Gold", "Desc", "MS-62", "url1");
        coin2 = new Coin(2L, "Morgan", "USA", 1881, "Silver", "Desc", "MS-64", "url2");
    }

    @Test
    public void testGetAllCoins() throws Exception {
        given(coinService.getAllCoins()).willReturn(Arrays.asList(coin1, coin2));

        mockMvc.perform(get("/api/coins")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].name", is("Centenario")))
                .andExpect(jsonPath("$[1].name", is("Morgan")));
    }

    @Test
    public void testGetCoinById_Found() throws Exception {
        given(coinService.getCoinById(1L)).willReturn(Optional.of(coin1));

        mockMvc.perform(get("/api/coins/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Centenario")))
                .andExpect(jsonPath("$.country", is("Mexico")));
    }

    @Test
    public void testGetCoinById_NotFound() throws Exception {
        given(coinService.getCoinById(99L)).willReturn(Optional.empty());

        mockMvc.perform(get("/api/coins/99")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
