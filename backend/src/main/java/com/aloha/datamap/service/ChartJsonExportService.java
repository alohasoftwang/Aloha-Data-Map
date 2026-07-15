package com.aloha.datamap.service;

import com.aloha.datamap.dto.ChartExportResultDto;
import com.aloha.datamap.dto.ChartExportResultDto.ExportedFile;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ChartJsonExportService {

    private static final String INDICATOR_CODE = "NY.GDP.MKTP.CD";
    private static final int START_YEAR = 1960;
    private static final int UPDATE_FREQUENCY = 2250;

    private static final List<String> SOUTH_ASIA_CODES = List.of(
            "IND", "PAK", "BGD", "LKA", "NPL", "BTN", "MDV", "AFG");

    private static final List<String> SOUTHEAST_ASIA_CODES = List.of(
            "IDN", "THA", "MYS", "SGP", "VNM", "PHL", "MMR", "KHM", "LAO", "BRN", "TLS");

    private static final List<String> MIDDLE_EAST_CODES = List.of(
            "SAU", "TUR", "IRN", "ARE", "ISR", "IRQ", "QAT", "KWT", "OMN", "BHR",
            "JOR", "LBN", "SYR", "YEM", "CYP");

    private static final Set<String> EUROPE_CODES = Set.of(
            "ALB", "AND", "AUT", "BEL", "BGR", "BIH", "BLR", "CHE",
            "CYP", "CZE", "DEU", "DNK", "ESP", "EST", "FIN", "FRA",
            "GBR", "GRC", "HRV", "HUN", "IRL", "ISL", "ITA", "LIE",
            "LTU", "LUX", "LVA", "MCO", "MDA", "MKD", "MLT", "MNE",
            "NLD", "NOR", "POL", "PRT", "ROU", "RUS", "SMR", "SRB",
            "SVK", "SVN", "SWE", "UKR", "XKX", "SUN");

    private static final Set<String> AFRICA_CODES = Set.of(
            "AGO", "BDI", "BEN", "BFA", "BWA", "CAF", "CIV", "CMR",
            "COD", "COG", "COM", "CPV", "DJI", "DZA", "EGY", "ERI",
            "ETH", "GAB", "GHA", "GIN", "GMB", "GNB", "GNQ", "KEN",
            "LBR", "LBY", "LSO", "MAR", "MDG", "MLI", "MOZ", "MRT",
            "MUS", "MWI", "NAM", "NER", "NGA", "RWA", "SDN", "SEN",
            "SLE", "SOM", "SSD", "STP", "SWZ", "SYC", "TCD", "TGO",
            "TUN", "TZA", "UGA", "ZAF", "ZMB", "ZWE");

    private static final Set<String> SOUTH_AMERICA_CODES = Set.of(
            "ARG", "BOL", "BRA", "CHL", "COL", "ECU",
            "GUY", "PER", "PRY", "SUR", "URY", "VEN");

    private static final Set<String> ASIA_CODES = Set.of(
            "CHN", "JPN", "KOR", "PRK", "MNG",
            "IDN", "THA", "MYS", "SGP", "VNM", "PHL", "MMR", "KHM", "LAO", "BRN", "TLS",
            "IND", "PAK", "BGD", "LKA", "NPL", "BTN", "MDV", "AFG",
            "SAU", "ARE", "QAT", "KWT", "OMN", "BHR", "ISR", "JOR", "LBN", "IRQ", "IRN",
            "SYR", "YEM", "TUR", "CYP",
            "KAZ", "UZB", "TKM", "KGZ", "TJK");

    private static final Map<String, String> ISO3_TO_ISO2 = Map.ofEntries(
            Map.entry("AFG", "af"), Map.entry("AGO", "ao"), Map.entry("ALB", "al"),
            Map.entry("AND", "ad"), Map.entry("ARE", "ae"), Map.entry("ARG", "ar"),
            Map.entry("AUS", "au"), Map.entry("AUT", "at"), Map.entry("BDI", "bi"),
            Map.entry("BEL", "be"), Map.entry("BEN", "bj"), Map.entry("BFA", "bf"),
            Map.entry("BGD", "bd"), Map.entry("BGR", "bg"), Map.entry("BHR", "bh"),
            Map.entry("BIH", "ba"), Map.entry("BLR", "by"), Map.entry("BOL", "bo"),
            Map.entry("BRA", "br"), Map.entry("BRN", "bn"), Map.entry("BTN", "bt"), Map.entry("BWA", "bw"),
            Map.entry("CAF", "cf"), Map.entry("CAN", "ca"), Map.entry("CHE", "ch"),
            Map.entry("CHL", "cl"), Map.entry("CHN", "cn"), Map.entry("CIV", "ci"),
            Map.entry("CMR", "cm"), Map.entry("COD", "cd"), Map.entry("COG", "cg"),
            Map.entry("COL", "co"), Map.entry("COM", "km"), Map.entry("CPV", "cv"),
            Map.entry("CYP", "cy"), Map.entry("CZE", "cz"), Map.entry("DEU", "de"),
            Map.entry("DJI", "dj"), Map.entry("DNK", "dk"), Map.entry("DZA", "dz"),
            Map.entry("ECU", "ec"), Map.entry("EGY", "eg"), Map.entry("ERI", "er"),
            Map.entry("ESP", "es"), Map.entry("EST", "ee"), Map.entry("ETH", "et"),
            Map.entry("FIN", "fi"), Map.entry("FRA", "fr"), Map.entry("GAB", "ga"),
            Map.entry("GBR", "gb"), Map.entry("GHA", "gh"), Map.entry("GIN", "gn"),
            Map.entry("GMB", "gm"), Map.entry("GNB", "gw"), Map.entry("GNQ", "gq"),
            Map.entry("GRC", "gr"), Map.entry("GUY", "gy"), Map.entry("HKG", "hk"),
            Map.entry("HRV", "hr"), Map.entry("HUN", "hu"), Map.entry("IDN", "id"),
            Map.entry("IND", "in"), Map.entry("IRL", "ie"), Map.entry("IRN", "ir"),
            Map.entry("IRQ", "iq"), Map.entry("ISL", "is"), Map.entry("ISR", "il"),
            Map.entry("ITA", "it"), Map.entry("JOR", "jo"), Map.entry("JPN", "jp"),
            Map.entry("KAZ", "kz"), Map.entry("KEN", "ke"), Map.entry("KGZ", "kg"),
            Map.entry("KHM", "kh"), Map.entry("KOR", "kr"), Map.entry("KWT", "kw"),
            Map.entry("LAO", "la"), Map.entry("LBN", "lb"), Map.entry("LBR", "lr"),
            Map.entry("LBY", "ly"), Map.entry("LIE", "li"), Map.entry("LKA", "lk"),
            Map.entry("LSO", "ls"), Map.entry("LTU", "lt"), Map.entry("LUX", "lu"),
            Map.entry("LVA", "lv"), Map.entry("MAC", "mo"), Map.entry("MAR", "ma"),
            Map.entry("MCO", "mc"), Map.entry("MDA", "md"), Map.entry("MDG", "mg"),
            Map.entry("MDV", "mv"), Map.entry("MEX", "mx"), Map.entry("MKD", "mk"),
            Map.entry("MLI", "ml"), Map.entry("MLT", "mt"), Map.entry("MMR", "mm"),
            Map.entry("MNE", "me"), Map.entry("MNG", "mn"), Map.entry("MOZ", "mz"),
            Map.entry("MRT", "mr"), Map.entry("MUS", "mu"), Map.entry("MWI", "mw"),
            Map.entry("MYS", "my"), Map.entry("NAM", "na"), Map.entry("NER", "ne"),
            Map.entry("NGA", "ng"), Map.entry("NLD", "nl"), Map.entry("NOR", "no"),
            Map.entry("NPL", "np"), Map.entry("OMN", "om"), Map.entry("PAK", "pk"),
            Map.entry("PER", "pe"), Map.entry("PHL", "ph"), Map.entry("POL", "pl"),
            Map.entry("PRT", "pt"), Map.entry("PRK", "kp"), Map.entry("PRY", "py"),
            Map.entry("QAT", "qa"), Map.entry("ROU", "ro"), Map.entry("RUS", "ru"),
            Map.entry("RWA", "rw"), Map.entry("SAU", "sa"), Map.entry("SDN", "sd"),
            Map.entry("SEN", "sn"), Map.entry("SGP", "sg"), Map.entry("SLE", "sl"),
            Map.entry("SMR", "sm"), Map.entry("SOM", "so"), Map.entry("SRB", "rs"),
            Map.entry("SSD", "ss"), Map.entry("STP", "st"), Map.entry("SUN", "su"),
            Map.entry("SUR", "sr"), Map.entry("SVK", "sk"), Map.entry("SVN", "si"),
            Map.entry("SWE", "se"), Map.entry("SWZ", "sz"), Map.entry("SYC", "sc"),
            Map.entry("SYR", "sy"), Map.entry("TCD", "td"), Map.entry("TGO", "tg"),
            Map.entry("THA", "th"), Map.entry("TJK", "tj"), Map.entry("TKM", "tm"),
            Map.entry("TLS", "tl"), Map.entry("TUN", "tn"), Map.entry("TUR", "tr"),
            Map.entry("TWN", "tw"), Map.entry("TZA", "tz"), Map.entry("UGA", "ug"),
            Map.entry("UKR", "ua"), Map.entry("URY", "uy"), Map.entry("USA", "us"),
            Map.entry("UZB", "uz"), Map.entry("VEN", "ve"), Map.entry("VNM", "vn"),
            Map.entry("XKX", "xk"), Map.entry("YEM", "ye"), Map.entry("ZAF", "za"),
            Map.entry("ZMB", "zm"), Map.entry("ZWE", "zw"));

    private static final Map<String, String> DISPLAY_NAME_OVERRIDES = Map.ofEntries(
            Map.entry("USA", "UNITED STATES"),
            Map.entry("GBR", "UNITED KINGDOM"),
            Map.entry("KOR", "SOUTH KOREA"),
            Map.entry("PRK", "NORTH KOREA"),
            Map.entry("RUS", "RUSSIA"),
            Map.entry("IRN", "IRAN"),
            Map.entry("VEN", "VENEZUELA"),
            Map.entry("TUR", "TURKIYE"),
            Map.entry("NLD", "NETHERLANDS"),
            Map.entry("CHE", "SWITZERLAND"),
            Map.entry("IDN", "INDONESIA"),
            Map.entry("SAU", "SAUDI ARABIA"),
            Map.entry("POL", "POLAND"),
            Map.entry("SWE", "SWEDEN"),
            Map.entry("BEL", "BELGIUM"),
            Map.entry("ARG", "ARGENTINA"),
            Map.entry("BRA", "BRAZIL"),
            Map.entry("CHL", "CHILE"),
            Map.entry("COL", "COLOMBIA"),
            Map.entry("PER", "PERU"),
            Map.entry("BOL", "BOLIVIA"),
            Map.entry("ECU", "ECUADOR"),
            Map.entry("PRY", "PARAGUAY"),
            Map.entry("URY", "URUGUAY"),
            Map.entry("GUY", "GUYANA"),
            Map.entry("SUR", "SURINAME"),
            Map.entry("AUT", "AUSTRIA"),
            Map.entry("NOR", "NORWAY"),
            Map.entry("ISR", "ISRAEL"),
            Map.entry("ARE", "UNITED ARAB EMIRATES"),
            Map.entry("QAT", "QATAR"),
            Map.entry("KWT", "KUWAIT"),
            Map.entry("OMN", "OMAN"),
            Map.entry("BHR", "BAHRAIN"),
            Map.entry("JOR", "JORDAN"),
            Map.entry("LBN", "LEBANON"),
            Map.entry("IRQ", "IRAQ"),
            Map.entry("SYR", "SYRIA"),
            Map.entry("YEM", "YEMEN"),
            Map.entry("CYP", "CYPRUS"),
            Map.entry("THA", "THAILAND"),
            Map.entry("NGA", "NIGERIA"),
            Map.entry("EGY", "EGYPT"),
            Map.entry("ZAF", "SOUTH AFRICA"),
            Map.entry("DZA", "ALGERIA"),
            Map.entry("MAR", "MOROCCO"),
            Map.entry("COD", "CONGO, DEM. REP."),
            Map.entry("CIV", "COTE D'IVOIRE"),
            Map.entry("PHL", "PHILIPPINES"),
            Map.entry("PAK", "PAKISTAN"),
            Map.entry("BGD", "BANGLADESH"),
            Map.entry("VNM", "VIETNAM"),
            Map.entry("MYS", "MALAYSIA"),
            Map.entry("SGP", "SINGAPORE"),
            Map.entry("HKG", "HONG KONG (※)"),
            Map.entry("MAC", "MACAO (※)"),
            Map.entry("TWN", "TAIWAN (※)"),
            Map.entry("SUN", "SOVIET UNION"));

    private static final Map<String, String> COUNTRY_COLORS = Map.ofEntries(
            Map.entry("UNITED STATES", "#5b9fd4"),
            Map.entry("CHINA", "#e85d6a"),
            Map.entry("JAPAN", "#c77dba"),
            Map.entry("GERMANY", "#7aabde"),
            Map.entry("INDIA", "#f0a070"),
            Map.entry("UNITED KINGDOM", "#6888d8"),
            Map.entry("FRANCE", "#6ed4c8"),
            Map.entry("ITALY", "#8ed482"),
            Map.entry("BRAZIL", "#7ec87a"),
            Map.entry("CANADA", "#d48ec4"),
            Map.entry("RUSSIA", "#e89868"),
            Map.entry("SOUTH KOREA", "#5ec9d8"),
            Map.entry("AUSTRALIA", "#f0d060"),
            Map.entry("MEXICO", "#62c4de"),
            Map.entry("SPAIN", "#e8c868"),
            Map.entry("SOVIET UNION", "#cc2b2b"),
            Map.entry("INDONESIA", "#d4a574"),
            Map.entry("NETHERLANDS", "#f08080"),
            Map.entry("SAUDI ARABIA", "#98d8a0"),
            Map.entry("TURKIYE", "#c9a0dc"),
            Map.entry("SWITZERLAND", "#ffb347"));

    private static final String[] FALLBACK_COLORS = {
            "#5b9fd4", "#e85d6a", "#c77dba", "#7aabde", "#f0a070", "#6888d8",
            "#6ed4c8", "#8ed482", "#7ec87a", "#d48ec4", "#e89868", "#5ec9d8",
            "#f0d060", "#62c4de", "#e8c868", "#d4a574", "#f08080", "#98d8a0"
    };

    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final Path dataDir;
    private final Path publicDataDir;

    public ChartJsonExportService(
            JdbcTemplate jdbcTemplate,
            @Value("${app.data.output-dir:../data}") String dataOutputDir,
            @Value("${app.chart.public-dir:../frontend/public/data}") String publicDataDir) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
        this.dataDir = Path.of(dataOutputDir).toAbsolutePath().normalize();
        this.publicDataDir = Path.of(publicDataDir).toAbsolutePath().normalize();
    }

    public ChartExportResultDto exportAll() {
        try {
            List<ExportedFile> files = new ArrayList<>();
            files.add(writeChart(buildWorldTop15(), "world-gdp-top10.json"));
            files.add(writeChart(buildAsiaTop15(), "asia-gdp-top15.json"));
            files.add(writeChart(buildEuropeTop15(), "europe-gdp-top15.json"));
            files.add(writeChart(buildAfricaTop15(), "africa-gdp-top15.json"));
            files.add(writeChart(buildSouthAmericaTop15(), "south-america-gdp.json"));
            files.add(writeChart(buildFixedSetChart(
                    "south-asia-gdp",
                    "SOUTH ASIA GDP RACE",
                    8,
                    SOUTH_ASIA_CODES,
                    "South Asia 8 entities (IND, PAK, BGD, LKA, NPL, BTN, MDV, AFG)"),
                    "south-asia-gdp.json"));
            files.add(writeChart(buildFixedSetChart(
                    "southeast-asia-gdp",
                    "SOUTHEAST ASIA GDP RACE",
                    11,
                    SOUTHEAST_ASIA_CODES,
                    "Southeast Asia entities"),
                    "southeast-asia-gdp.json"));
            files.add(writeChart(buildFixedSetChart(
                    "middle-east-gdp",
                    "MIDDLE EAST GDP RACE",
                    15,
                    MIDDLE_EAST_CODES,
                    "Middle East entities"),
                    "middle-east-gdp.json"));
            return new ChartExportResultDto("Chart JSON refreshed from database", files);
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to write chart JSON: " + e.getMessage(),
                    e);
        }
    }

    /** 按图表 id 只刷新对应 JSON，如 asia-gdp-top15 */
    public ChartExportResultDto exportOne(String chartId) {
        try {
            ExportedFile file = switch (chartId) {
                case "world-gdp-top15", "world-gdp-top10" ->
                        writeChart(buildWorldTop15(), "world-gdp-top10.json");
                case "asia-gdp-top15" ->
                        writeChart(buildAsiaTop15(), "asia-gdp-top15.json");
                case "europe-gdp-top15" ->
                        writeChart(buildEuropeTop15(), "europe-gdp-top15.json");
                case "africa-gdp-top15" ->
                        writeChart(buildAfricaTop15(), "africa-gdp-top15.json");
                case "south-america-gdp", "south-america-gdp-top15" ->
                        writeChart(buildSouthAmericaTop15(), "south-america-gdp.json");
                case "south-asia-gdp" ->
                        writeChart(buildFixedSetChart(
                                "south-asia-gdp",
                                "SOUTH ASIA GDP RACE",
                                8,
                                SOUTH_ASIA_CODES,
                                "South Asia 8 entities (IND, PAK, BGD, LKA, NPL, BTN, MDV, AFG)"),
                                "south-asia-gdp.json");
                case "southeast-asia-gdp" ->
                        writeChart(buildFixedSetChart(
                                "southeast-asia-gdp",
                                "SOUTHEAST ASIA GDP RACE",
                                11,
                                SOUTHEAST_ASIA_CODES,
                                "Southeast Asia entities"),
                                "southeast-asia-gdp.json");
                case "middle-east-gdp" ->
                        writeChart(buildFixedSetChart(
                                "middle-east-gdp",
                                "MIDDLE EAST GDP RACE",
                                15,
                                MIDDLE_EAST_CODES,
                                "Middle East entities"),
                                "middle-east-gdp.json");
                default -> throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unknown chart id: " + chartId);
            };
            return new ChartExportResultDto("Chart JSON refreshed: " + chartId, List.of(file));
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to write chart JSON: " + e.getMessage(),
                    e);
        }
    }

    private Map<String, Object> buildWorldTop15() {
        List<GdpRow> rows = queryWorldRows();
        Map<String, CountrySeries> byCountry = toSeriesMap(rows);
        if (byCountry.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No world GDP data found");
        }

        boolean hasSun = byCountry.containsKey("SUN");
        List<Integer> years = buildYearList(byCountry);
        int endYear = years.get(years.size() - 1);

        Set<String> topCodes = new HashSet<>();
        for (int year : years) {
            List<Map.Entry<String, Double>> ranked = byCountry.entrySet().stream()
                    .filter(e -> e.getValue().years.containsKey(year))
                    .filter(e -> !(Objects.equals(e.getKey(), "RUS") && year <= 1991 && hasSun))
                    .map(e -> Map.entry(e.getKey(), e.getValue().years.get(year)))
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(15)
                    .toList();
            ranked.forEach(e -> topCodes.add(e.getKey()));
        }

        List<String> selected = topCodes.stream()
                .sorted(Comparator.comparingDouble(
                        (String code) -> byCountry.get(code).years.getOrDefault(endYear, 0.0)).reversed())
                .toList();

        return buildChartObject(
                "world-gdp-top15",
                "TOP 15 WORLD GDP",
                15,
                years,
                endYear,
                selected,
                byCountry,
                hasSun,
                Map.of(
                        "source", "mysql:aloha_datamap",
                        "indicator", INDICATOR_CODE,
                        "entityCount", selected.size(),
                        "note", "Entities that appeared in global GDP top 15 at least once"));
    }

    private Map<String, Object> buildAsiaTop15() {
        List<GdpRow> rows = queryByCodes(ASIA_CODES, true);
        Map<String, CountrySeries> byCountry = toSeriesMap(rows);
        if (byCountry.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Asia GDP data found");
        }

        List<Integer> years = buildYearList(byCountry);
        int endYear = years.get(years.size() - 1);

        Set<String> topCodes = new HashSet<>();
        for (int year : years) {
            byCountry.entrySet().stream()
                    .filter(e -> e.getValue().years.containsKey(year))
                    .map(e -> Map.entry(e.getKey(), e.getValue().years.get(year)))
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(15)
                    .forEach(e -> topCodes.add(e.getKey()));
        }

        List<String> selected = topCodes.stream()
                .sorted(Comparator.comparingDouble(
                        (String code) -> byCountry.get(code).years.getOrDefault(endYear, 0.0)).reversed())
                .toList();

        return buildChartObject(
                "asia-gdp-top15",
                "TOP 15 ASIA GDP",
                15,
                years,
                endYear,
                selected,
                byCountry,
                false,
                Map.of(
                        "source", "mysql:aloha_datamap",
                        "indicator", INDICATOR_CODE,
                        "scope", "geographic_asia",
                        "entityCount", selected.size(),
                        "note", "Top 15 by GDP among geographic Asia, excl. HK/MO/TW"));
    }

    private Map<String, Object> buildEuropeTop15() {
        Set<String> europeWithoutSun = new HashSet<>(EUROPE_CODES);
        europeWithoutSun.remove("SUN");
        List<GdpRow> rows = new ArrayList<>(queryByCodes(europeWithoutSun, true));
        rows.addAll(querySunRows());
        Map<String, CountrySeries> byCountry = toSeriesMap(rows);
        if (byCountry.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Europe GDP data found");
        }

        boolean hasSun = byCountry.containsKey("SUN");
        List<Integer> years = buildYearList(byCountry);
        int endYear = years.get(years.size() - 1);

        Set<String> topCodes = new HashSet<>();
        for (int year : years) {
            byCountry.entrySet().stream()
                    .filter(e -> e.getValue().years.containsKey(year))
                    .filter(e -> !(Objects.equals(e.getKey(), "RUS") && year <= 1991 && hasSun))
                    .map(e -> Map.entry(e.getKey(), e.getValue().years.get(year)))
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(15)
                    .forEach(e -> topCodes.add(e.getKey()));
        }

        List<String> selected = topCodes.stream()
                .sorted(Comparator.comparingDouble(
                        (String code) -> byCountry.get(code).years.getOrDefault(endYear, 0.0)).reversed())
                .toList();

        return buildChartObject(
                "europe-gdp-top15",
                "TOP 15 EUROPE GDP",
                15,
                years,
                endYear,
                selected,
                byCountry,
                hasSun,
                Map.of(
                        "source", "mysql:aloha_datamap",
                        "indicator", INDICATOR_CODE,
                        "scope", "geographic_europe",
                        "entityCount", selected.size(),
                        "note", "Top 15 by GDP among geographic Europe (incl. SUN historically)"));
    }

    private Map<String, Object> buildAfricaTop15() {
        List<GdpRow> rows = queryByCodes(AFRICA_CODES, true);
        Map<String, CountrySeries> byCountry = toSeriesMap(rows);
        if (byCountry.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No Africa GDP data found");
        }

        List<Integer> years = buildYearList(byCountry);
        int endYear = years.get(years.size() - 1);

        Set<String> topCodes = new HashSet<>();
        for (int year : years) {
            byCountry.entrySet().stream()
                    .filter(e -> e.getValue().years.containsKey(year))
                    .map(e -> Map.entry(e.getKey(), e.getValue().years.get(year)))
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(15)
                    .forEach(e -> topCodes.add(e.getKey()));
        }

        List<String> selected = topCodes.stream()
                .sorted(Comparator.comparingDouble(
                        (String code) -> byCountry.get(code).years.getOrDefault(endYear, 0.0)).reversed())
                .toList();

        return buildChartObject(
                "africa-gdp-top15",
                "TOP 15 AFRICA GDP",
                15,
                years,
                endYear,
                selected,
                byCountry,
                false,
                Map.of(
                        "source", "mysql:aloha_datamap",
                        "indicator", INDICATOR_CODE,
                        "scope", "geographic_africa",
                        "entityCount", selected.size(),
                        "note", "Top 15 by GDP among geographic Africa"));
    }

    private Map<String, Object> buildSouthAmericaTop15() {
        List<GdpRow> rows = queryByCodes(SOUTH_AMERICA_CODES, true);
        Map<String, CountrySeries> byCountry = toSeriesMap(rows);
        if (byCountry.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No South America GDP data found");
        }

        List<Integer> years = buildYearList(byCountry);
        int endYear = years.get(years.size() - 1);

        Set<String> topCodes = new HashSet<>();
        for (int year : years) {
            byCountry.entrySet().stream()
                    .filter(e -> e.getValue().years.containsKey(year))
                    .map(e -> Map.entry(e.getKey(), e.getValue().years.get(year)))
                    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
                    .limit(15)
                    .forEach(e -> topCodes.add(e.getKey()));
        }

        List<String> selected = topCodes.stream()
                .sorted(Comparator.comparingDouble(
                        (String code) -> byCountry.get(code).years.getOrDefault(endYear, 0.0)).reversed())
                .toList();

        return buildChartObject(
                "south-america-gdp",
                "SOUTH AMERICA GDP",
                12,
                years,
                endYear,
                selected,
                byCountry,
                false,
                Map.of(
                        "source", "mysql:aloha_datamap",
                        "indicator", INDICATOR_CODE,
                        "scope", "geographic_south_america",
                        "entityCount", selected.size(),
                        "note", "South America 12 sovereign countries"));
    }

    private Map<String, Object> buildFixedSetChart(
            String id,
            String title,
            int maxBars,
            List<String> orderedCodes,
            String note) {
        List<GdpRow> rows = queryByCodes(new HashSet<>(orderedCodes), false);
        Map<String, CountrySeries> byCountry = toSeriesMap(rows);
        if (byCountry.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No GDP data for " + id);
        }

        List<Integer> years = buildYearList(byCountry);
        int endYear = years.get(years.size() - 1);
        List<String> selected = orderedCodes.stream().filter(byCountry::containsKey).toList();

        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("source", "mysql:aloha_datamap");
        meta.put("indicator", INDICATOR_CODE);
        meta.put("entityCount", selected.size());
        meta.put("countryCodes", selected);
        meta.put("note", note);

        return buildChartObject(id, title, maxBars, years, endYear, selected, byCountry, false, meta);
    }

    private Map<String, Object> buildChartObject(
            String id,
            String title,
            int maxBars,
            List<Integer> years,
            int endYear,
            List<String> selected,
            Map<String, CountrySeries> byCountry,
            boolean skipRusPre1992,
            Map<String, Object> metaExtra) {
        List<Object> dataset = new ArrayList<>();
        dataset.add(List.of("GDP", "Entity", "Year"));

        Map<String, String> entityColors = new LinkedHashMap<>();
        Map<String, String> entityCodes = new LinkedHashMap<>();
        Map<String, String> entityFlagImages = new LinkedHashMap<>();

        int idx = 0;
        for (String code : selected) {
            CountrySeries series = byCountry.get(code);
            String name = series.name;
            String iso2 = ISO3_TO_ISO2.getOrDefault(code, code.substring(0, 2).toLowerCase(Locale.ROOT));
            entityColors.put(name, pickColor(name, idx++));
            entityCodes.put(name, iso2);
            entityFlagImages.put(name, "/flags/" + iso2 + ".png");

            for (int year : years) {
                Double value = series.years.get(year);
                if (value == null) {
                    continue;
                }
                if (skipRusPre1992 && "RUS".equals(code) && year <= 1991 && byCountry.containsKey("SUN")) {
                    continue;
                }
                long million = Math.round(value / 1_000_000.0);
                dataset.add(List.of(million, name, year));
            }
        }

        Map<String, Object> meta = new LinkedHashMap<>(metaExtra);
        meta.put("rowCount", dataset.size() - 1);

        Map<String, Object> chart = new LinkedHashMap<>();
        chart.put("id", id);
        chart.put("title", title);
        chart.put("unit", "(IN MILLION $)");
        chart.put("chartType", "bar-race");
        chart.put("updateFrequency", UPDATE_FREQUENCY);
        chart.put("maxBars", maxBars);
        chart.put("startYear", years.get(0));
        chart.put("endYear", endYear);
        chart.put("years", years);
        chart.put("entityColors", entityColors);
        chart.put("entityCodes", entityCodes);
        chart.put("entityFlagImages", entityFlagImages);
        chart.put("dataset", dataset);
        chart.put("_meta", meta);
        return chart;
    }

    private ExportedFile writeChart(Map<String, Object> chart, String fileName) throws IOException {
        Files.createDirectories(dataDir);
        Files.createDirectories(publicDataDir);
        Path dataPath = dataDir.resolve(fileName);
        Path publicPath = publicDataDir.resolve(fileName);
        byte[] json = objectMapper.writeValueAsBytes(chart);
        Files.write(dataPath, json);
        Files.write(publicPath, json);

        @SuppressWarnings("unchecked")
        Map<String, Object> meta = (Map<String, Object>) chart.get("_meta");
        return new ExportedFile(
                String.valueOf(chart.get("id")),
                publicPath.toString(),
                ((Number) chart.get("startYear")).intValue(),
                ((Number) chart.get("endYear")).intValue(),
                ((Number) meta.get("entityCount")).intValue(),
                ((Number) meta.get("rowCount")).intValue());
    }

    private List<GdpRow> queryWorldRows() {
        String sql = """
                SELECT c.country_code, c.country_name, g.gdp_year, g.value_usd
                FROM wb_gdp_value g
                JOIN wb_country c ON c.id = g.country_id
                JOIN wb_indicator i ON i.id = g.indicator_id
                WHERE i.indicator_code = ?
                  AND g.gdp_year >= ?
                  AND g.value_usd IS NOT NULL
                  AND c.income_group IS NOT NULL
                  AND c.region IS NOT NULL
                ORDER BY g.gdp_year, g.value_usd DESC
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new GdpRow(
                rs.getString(1),
                rs.getString(2),
                rs.getInt(3),
                rs.getBigDecimal(4)), INDICATOR_CODE, START_YEAR);
    }

    private List<GdpRow> querySunRows() {
        String sql = """
                SELECT c.country_code, c.country_name, g.gdp_year, g.value_usd
                FROM wb_gdp_value g
                JOIN wb_country c ON c.id = g.country_id
                JOIN wb_indicator i ON i.id = g.indicator_id
                WHERE i.indicator_code = ?
                  AND g.gdp_year >= ?
                  AND g.value_usd IS NOT NULL
                  AND c.country_code = 'SUN'
                ORDER BY g.gdp_year
                """;
        return jdbcTemplate.query(sql, (rs, rowNum) -> new GdpRow(
                rs.getString(1),
                rs.getString(2),
                rs.getInt(3),
                rs.getBigDecimal(4)), INDICATOR_CODE, START_YEAR);
    }

    private List<GdpRow> queryByCodes(Set<String> codes, boolean requireIncomeGroup) {
        String placeholders = codes.stream().map(c -> "?").collect(Collectors.joining(", "));
        String incomeClause = requireIncomeGroup ? "AND c.income_group IS NOT NULL" : "";
        String sql = """
                SELECT c.country_code, c.country_name, g.gdp_year, g.value_usd
                FROM wb_gdp_value g
                JOIN wb_country c ON c.id = g.country_id
                JOIN wb_indicator i ON i.id = g.indicator_id
                WHERE i.indicator_code = ?
                  AND g.gdp_year >= ?
                  AND g.value_usd IS NOT NULL
                  %s
                  AND c.country_code IN (%s)
                ORDER BY g.gdp_year, g.value_usd DESC
                """.formatted(incomeClause, placeholders);

        List<Object> params = new ArrayList<>();
        params.add(INDICATOR_CODE);
        params.add(START_YEAR);
        params.addAll(codes);

        return jdbcTemplate.query(sql, (rs, rowNum) -> new GdpRow(
                rs.getString(1),
                rs.getString(2),
                rs.getInt(3),
                rs.getBigDecimal(4)), params.toArray());
    }

    private Map<String, CountrySeries> toSeriesMap(List<GdpRow> rows) {
        Map<String, CountrySeries> map = new HashMap<>();
        for (GdpRow row : rows) {
            CountrySeries series = map.computeIfAbsent(
                    row.code(),
                    code -> new CountrySeries(displayName(code, row.name()), new HashMap<>()));
            if (row.value() != null) {
                series.years.put(row.year(), row.value().doubleValue());
            }
        }
        return map;
    }

    private List<Integer> buildYearList(Map<String, CountrySeries> byCountry) {
        TreeSet<Integer> allYears = new TreeSet<>();
        byCountry.values().forEach(s -> allYears.addAll(s.years.keySet()));
        int start = Math.max(START_YEAR, allYears.first());
        int end = allYears.last();
        List<Integer> years = new ArrayList<>();
        for (int y = start; y <= end; y++) {
            years.add(y);
        }
        return years;
    }

    private static String displayName(String code, String name) {
        if (DISPLAY_NAME_OVERRIDES.containsKey(code)) {
            return DISPLAY_NAME_OVERRIDES.get(code);
        }
        return name == null ? code : name.trim().replaceAll("\\s+", " ").toUpperCase(Locale.ROOT);
    }

    private static String pickColor(String name, int index) {
        return COUNTRY_COLORS.getOrDefault(name, FALLBACK_COLORS[index % FALLBACK_COLORS.length]);
    }

    private record GdpRow(String code, String name, int year, BigDecimal value) {
    }

    private static final class CountrySeries {
        private final String name;
        private final Map<Integer, Double> years;

        private CountrySeries(String name, Map<Integer, Double> years) {
            this.name = name;
            this.years = years;
        }
    }
}
